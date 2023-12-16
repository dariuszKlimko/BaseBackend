import { Injectable } from "@nestjs/common";
import { User } from "@app/entities/user.entity";
import { CreateUserDto } from "@app/dtos/user/create-user.dto";
import { UserAuthenticateException } from "@app/common/exceptions/auth/userAuthenticate.exception";
import { UserNotVerifiedException } from "@app/common/exceptions/auth/userNotVerified.exception";
import { MessageInfo } from "@app/dtos/auth/message-info-response";
import { InvalidRefreshTokenException } from "@app/common/exceptions/auth/invalidRefreshToken.exception";
import { LogoutResponse } from "@app/dtos/auth/logout-response";
import { UserAlreadyConfirmedException } from "@app/common/exceptions/auth/userAlreadyConfirmed.exception";
import { UpdateCredentialsDto } from "@app/dtos/auth/update-creadentials.dto";
import { ResetPasswordDto } from "@app/dtos/auth/password-reset.dto";
import { InvalidVerificationCodeException } from "@app/common/exceptions/auth/invalidVerificationCode.exception ";
import { PASSWORD_RESET_RESPONSE, USER_VERIFIED_RESPONSE } from "@app/common/constans/constans";
import { UserRepository } from "@app/repositories/user.repository";
import { UserRepositoryIntrface } from "@app/repositories/interfaces/user.repository.interface";
import { INCORRECT_EMAIL_ADDRES_OR_PASSWORD, INVALID_REFRESH_TOKEN, INVALID_VERIFICATION_CODE, USER_WITH_GIVEN_EMAIL_IS_ALREADY_CONFIRMED, USER_WITH_GIVEN_EMAIL_IS_NOT_VERIFIED } from "@app/common/constans/exceptions.constans";

@Injectable()
export class AuthService {
  private readonly userRepository: UserRepositoryIntrface;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async userConfirmation(email: string): Promise<MessageInfo> {
    const user: User = await this.userRepository.findOneByConditionOrThrow({ email });
    if (user.verified) {
      throw new UserAlreadyConfirmedException(USER_WITH_GIVEN_EMAIL_IS_ALREADY_CONFIRMED);
    }
    await this.userRepository.updateOneById(user.id, { verified: true });
    return USER_VERIFIED_RESPONSE;
  }

  async comparePassword(userInfo: CreateUserDto): Promise<User> {
    const user: User = await this.userRepository.findOneByConditionOrThrow({ email: userInfo.email });
    const isMatch: boolean = await user.validatePassword(userInfo.password);
    if (!isMatch) {
      throw new UserAuthenticateException(INCORRECT_EMAIL_ADDRES_OR_PASSWORD);
    } else if (!user.verified) {
      throw new UserNotVerifiedException(USER_WITH_GIVEN_EMAIL_IS_NOT_VERIFIED);
    }
    return user;
  }

  async logout(id: string, token: string): Promise<LogoutResponse> {
    const user: User = await this.userRepository.findOneByIdOrThrow(id);
    const tokenIndex: number = user.refreshTokens.indexOf(token);
    if (tokenIndex < 0) {
      throw new InvalidRefreshTokenException(INVALID_REFRESH_TOKEN);
    }
    user.refreshTokens.splice(tokenIndex, 1);
    await this.userRepository.saveOne(user);
    return { email: user.email };
  }

  async resetPasswordConfirm(resetPassord: ResetPasswordDto): Promise<MessageInfo> {
    const user: User = await this.userRepository.findOneByConditionOrThrow({ email: resetPassord.email });
    if (user.verificationCode !== resetPassord.verificationCode) {
      throw new InvalidVerificationCodeException(INVALID_VERIFICATION_CODE);
    }
    user.password = resetPassord.password;
    user.verificationCode = null;
    await this.userRepository.saveOne(user);
    return PASSWORD_RESET_RESPONSE;
  }

  async updateCredentials(id: string, userInfo: UpdateCredentialsDto): Promise<User> {
    const user: User = await this.userRepository.findOneByIdOrThrow(id);
    if (userInfo.email) {
      user.email = userInfo.email;
    }
    if (user.password) {
      user.password = userInfo.password;
    }
    return await this.userRepository.saveOne(user);
  }
}
