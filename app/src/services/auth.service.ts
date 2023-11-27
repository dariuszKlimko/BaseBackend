import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "@app/entities/user.entity";
import { CreateUserDto } from "@app/dtos/user/create-user.dto";
import { UserAuthenticateException } from "@app/common/exceptions/auth/userAuthenticate.exception";
import { UserNotFoundException } from "@app/common/exceptions/user/userNotFound.exception";
import { UserNotVerifiedException } from "@app/common/exceptions/auth/userNotVerified.exception";
import { MessageInfo } from "@app/common/types/messageInfo";
import { InvalidRefreshTokenException } from "@app/common/exceptions/auth/invalidRefreshToken.exception";
import { LogoutResponse } from "@app/common/types/auth/logout-response";
import { UserAlreadyConfirmedException } from "@app/common/exceptions/auth/userAlreadyConfirmed.exception";
import { UpdateCredentialsDto } from "@app/dtos/auth/update-creadentials.dto";
import { ResetPasswordDto } from "@app/dtos/auth/password-reset.dto";
import { InvalidVerificationCodeException } from "@app/common/exceptions/auth/invalidVerificationCode.exception ";
import { PASSWORD_RESET_RESPONSE, USER_VERIFIED_RESPONSE } from "@app/common/constans/constans";

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  async userConfirmation(email: string): Promise<MessageInfo> {
    const user: User = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new UserNotFoundException("user with given email not exist in database");
    } else if (user.verified) {
      throw new UserAlreadyConfirmedException("user with given email is already confirmed");
    }
    await this.userRepository.update(user.id, { verified: true });
    return USER_VERIFIED_RESPONSE;
  }

  async comparePassword(userInfo: CreateUserDto): Promise<User> {
    const user: User = await this.userRepository.findOneBy({ email: userInfo.email });
    if (!user) {
      throw new UserNotFoundException("user with given email not exist in database");
    }
    const isMatch: boolean = await user.validatePassword(userInfo.password);
    if (!isMatch) {
      throw new UserAuthenticateException("incorrect email address or password");
    } else if (!user.verified) {
      throw new UserNotVerifiedException("user with given email is not verified");
    }
    return user;
  }

  async logout(id: string, token: string): Promise<LogoutResponse> {
    const user: User = await this.userRepository.findOneBy({ id });
    const tokenIndex: number = user.refreshTokens.indexOf(token);
    if (tokenIndex < 0) {
      throw new InvalidRefreshTokenException("invalid refreshToken");
    }
    user.refreshTokens.splice(tokenIndex, 1);
    await this.userRepository.save(user);
    return { email: user.email };
  }

  async resetPasswordConfirm(resetPassord: ResetPasswordDto): Promise<MessageInfo> {
    const user: User = await this.userRepository.findOneBy({ email: resetPassord.email });
    if (user.verificationCode !== resetPassord.verificationCode) {
      throw new InvalidVerificationCodeException("invalid verification code");
    }
    user.password = resetPassord.password;
    user.verificationCode = null;
    await this.userRepository.save(user);
    return PASSWORD_RESET_RESPONSE;
  }

  async updateCredentials(id: string, userInfo: UpdateCredentialsDto): Promise<User> {
    const user: User = await this.userRepository.findOneBy({ id });
    if (userInfo.email) {
      user.email = userInfo.email;
    }
    if (user.password) {
      user.password = userInfo.password;
    }
    return await this.userRepository.save(user);
  }
}
