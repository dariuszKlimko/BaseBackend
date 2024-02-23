import { Injectable, Logger } from "@nestjs/common";
import { User } from "@app/entities/user.entity";
import { CreateUserDto } from "@app/dtos/user/create.user.dto";
import { UserAuthenticateException } from "@app/common/exceptions/auth/user.authenticate.exception";
import { UserNotVerifiedException } from "@app/common/exceptions/auth/user.not.verified.exception";
import { MessageInfo } from "@app/dtos/auth/message.info.response";
import { UserAlreadyConfirmedException } from "@app/common/exceptions/auth/user.already.confirmed.exception";
import { UpdateCredentialsDto } from "@app/dtos/auth/update.creadentials.dto";
import { ResetPasswordDto } from "@app/dtos/auth/password.reset.dto";
import { InvalidVerificationCodeException } from "@app/common/exceptions/auth/invalid.verification.code.exception ";
import { PASSWORD_RESET_RESPONSE, USER_VERIFIED_RESPONSE } from "@app/common/constans/constans";
import {
  INCORRECT_EMAIL_ADDRES_OR_PASSWORD,
  INVALID_VERIFICATION_CODE,
  USER_WITH_GIVEN_EMAIL_IS_ALREADY_CONFIRMED,
  USER_WITH_GIVEN_EMAIL_IS_NOT_VERIFIED,
} from "@app/common/constans/exceptions.constans";
import { AuthServiceIntrface } from "@app/common/types/interfaces/services/auth.service.interface";
import { UserServiceIntrface } from "@app/common/types/interfaces/services/user.service.interface";
import { UserService } from "@app/services/user.service";

@Injectable()
export class AuthService implements AuthServiceIntrface {
  private readonly logger: Logger = new Logger(AuthService.name);
  private readonly userService: UserServiceIntrface;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async userConfirmation(email: string): Promise<MessageInfo> {
    const user: User = await this.userService.findOneByConditionOrThrow({ email });
    if (user.verified) {
      throw new UserAlreadyConfirmedException(USER_WITH_GIVEN_EMAIL_IS_ALREADY_CONFIRMED);
    }
    await this.userService.updateOne(user.id, { verified: true });
    return USER_VERIFIED_RESPONSE;
  }

  async comparePassword(userInfo: CreateUserDto): Promise<User> {
    const user: User = await this.userService.findOneByConditionOrThrow({ email: userInfo.email });
    const isMatch: boolean = await user.validatePassword(userInfo.password);
    if (!isMatch) {
      throw new UserAuthenticateException(INCORRECT_EMAIL_ADDRES_OR_PASSWORD);
    } else if (!user.verified) {
      throw new UserNotVerifiedException(USER_WITH_GIVEN_EMAIL_IS_NOT_VERIFIED);
    }
    return user;
  }

  async resetPasswordConfirm(resetPassord: ResetPasswordDto): Promise<MessageInfo> {
    const user: User = await this.userService.findOneByConditionOrThrow({ email: resetPassord.email });
    if (user.verificationCode !== resetPassord.verificationCode) {
      throw new InvalidVerificationCodeException(INVALID_VERIFICATION_CODE);
    }
    user.password = resetPassord.password;
    user.verificationCode = null;
    await this.userService.updateOne(user.id, user);
    return PASSWORD_RESET_RESPONSE;
  }

  async updateCredentials(id: string, userInfo: UpdateCredentialsDto): Promise<User> {
    const user: User = await this.userService.findOneByIdOrThrow(id);
    this.userService.mergeEntity(user, userInfo);
    await this.userService.updateOne(user.id, user);
    return await this.userService.findOneByIdOrThrow(user.id);
  }
}
