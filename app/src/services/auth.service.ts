import { Injectable, Logger } from "@nestjs/common";
import { User } from "@app/entities/user.entity";
import { CreateUserDto } from "@app/dtos/user/create.user.dto";
import { UserAuthenticateException } from "@app/common/exceptions/auth/user.authenticate.exception";
import { MessageInfo } from "@app/dtos/auth/message.info.response";
import { UserAlreadyConfirmedException } from "@app/common/exceptions/auth/user.already.confirmed.exception";
import { ResetPasswordDto } from "@app/dtos/auth/password.reset.dto";
import { InvalidVerificationCodeException } from "@app/common/exceptions/auth/invalid.verification.code.exception";
import { EXTERNAL_PROVIDER, PASSWORD_RESET_RESPONSE, USER_VERIFIED_RESPONSE } from "@app/common/constans/constans";
import {
  DULICATED_EXCEPTION_MESSAGE,
  INCORRECT_EMAIL_ADDRES_OR_PASSWORD,
  INVALID_VERIFICATION_CODE,
  OAUTH_USER_NOT_VERIFIED,
  USER_PROVIDED_BY_EXTERNAL_PROVIDER,
  USER_WITH_GIVEN_EMAIL_IS_ALREADY_CONFIRMED,
} from "@app/common/constans/exceptions.constans";
import { AuthServiceIntrface } from "@app/common/types/interfaces/services/auth.service.interface";
import { UserServiceIntrface } from "@app/common/types/interfaces/services/user.service.interface";
import { UserService } from "@app/services/user.service";
import { UpdatePasswordDto } from "@app/dtos/auth/update.password.dto";
import { ExternalProviderException } from "@app/common/exceptions/auth/external.provider.exception";
import { UserAuth } from "@app/common/types/type/userAuth";
import { OauthNotVerifiedUserException } from "@app/common/exceptions/auth/oauth.not.verified.user.exception";
import { UserDuplicatedException } from "@app/common/exceptions/user.duplicated.exception";
import { Profile } from "@app/entities/profile.entity";

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

  async updatePassword(id: string, userInfo: UpdatePasswordDto): Promise<User> {
    const user: User = await this.userService.findOneByIdOrThrow(id);
    this.userService.mergeEntity(user, userInfo);
    await this.userService.updateOne(user.id, user);
    return await this.userService.findOneByIdOrThrow(user.id);
  }

  async checkIfNotExternalProvider(email: string): Promise<User> {
    const user: User = await this.userService.findOneByConditionOrThrow({ email });
    if (user.provider.length !== 0) {
      throw new ExternalProviderException(USER_PROVIDED_BY_EXTERNAL_PROVIDER);
    }
    return user;
  }

  async googleOauth(userAuth: UserAuth): Promise<User> {
    if (!userAuth.verified) {
      console.log("DK____userAuth.verified: ",userAuth.verified);
      throw new OauthNotVerifiedUserException(OAUTH_USER_NOT_VERIFIED)
    }
    const user: [User[], number] = await this.userService.findOpenQuery({
      where: { email: userAuth.email }
    });
    console.log("DK____user: ",user);
    const authorizedUser: User = user[0][0];
    if (authorizedUser && authorizedUser.provider !== EXTERNAL_PROVIDER.GOOGLE) {
      console.log("DK____authorizedUser: ",authorizedUser);
      throw new UserDuplicatedException(DULICATED_EXCEPTION_MESSAGE);
    }
    else if (authorizedUser && authorizedUser.provider == EXTERNAL_PROVIDER.GOOGLE) {
      console.log("DK____authorizedUser_1: ",authorizedUser);
      return authorizedUser
    }
    else if (!authorizedUser) {
      console.log("DK____authorizedUser_1: ",authorizedUser);
      const userrrr  = await this.userService.oauthRegisterUser(userAuth); 
      console.log("DK____userrrr: ",userrrr);
      return userrrr;
      // return await this.userService.registerUser(authorizedUser);    
    }
  }
}
