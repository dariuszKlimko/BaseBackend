import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ArrayContains, Repository } from "typeorm";
import { User } from "@app/modules/user/entities/user.entity";
import { CreateUserDto } from "@app/modules/user/dto/create-user.dto";
import { JwtService } from "@nestjs/jwt";
import { randomBytes } from "crypto";
import { UserAuthenticateException } from "@app/modules/auth/exceptions/userAuthenticate.exception";
import { UserNotFoundException } from "@app/common/exceptions/userNotFound.exception";
import { UserNotVerifiedException } from "@app/modules/auth/exceptions/userNotVerified.exception";
import { LoginResponse } from "@app/modules/auth/types/login-response";
import { IncorrectVerificationCode } from "@app/modules/auth/exceptions/incorrectVerificationCode.exception";
import { MessageInfo } from "@app/common/types/messageInfo";
import { InvalidRefreshTokenException } from "@app/modules/auth/exceptions/invalidRefreshToken.exception";
import { LogoutResponse } from "@app/modules/auth/types/logout-response";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>, private jwtService: JwtService) {}

  async userConfirmation(verificationCode: string): Promise<MessageInfo> {
    const userDb = await this.userRepository.findOneBy({ verificationCode });
    if (!userDb) {
      throw new IncorrectVerificationCode("incorrect verification code");
    }
    await this.userRepository.update(userDb.id, { verificationCode: null, verified: true });
    return { status: "ok", message: "user successfully verified" };
  }

  async login(userInfo: CreateUserDto): Promise<LoginResponse> {
    const user = await this.userRepository.findOneBy({ email: userInfo.email });
    if (!user) {
      throw new UserNotFoundException("user with given email not exist in database");
    }
    const isMatch = await bcrypt.compare(userInfo.password, user.password);
    if (!isMatch) {
      throw new UserAuthenticateException("incorrect email address or password");
    } else if (!user.verified) {
      throw new UserNotVerifiedException("user with given email is not verivied");
    }
    return await this.tokensResponse(user);
  }

  async logout(id: string, token: string): Promise<LogoutResponse> {
    const user = await this.userRepository.findOneBy({ id });
    const tokenIndex = user.refreshTokens.indexOf(token);
    if (tokenIndex < 0) {
      throw new InvalidRefreshTokenException("invalid refreshToken");
    }
    user.refreshTokens.splice(tokenIndex, 1);
    await this.userRepository.save(user);
    return { email: user.email };
  }

  async getNewToken(refreshToken: string): Promise<LoginResponse> {
    const user = await this.userRepository.findOne({ where: { refreshTokens: ArrayContains([refreshToken]) } });
    if (!user) {
      throw new InvalidRefreshTokenException("invalid refreshToken");
    }
    const tokenIndex = user.refreshTokens.indexOf(refreshToken);
    user.refreshTokens.splice(tokenIndex, 1);
    return await this.tokensResponse(user);
  }

  private async tokensResponse(user: User): Promise<LoginResponse> {
    const payload = { sub: user.id };
    const token = randomBytes(64).toString("hex");
    user.refreshTokens.push(token);
    await this.userRepository.save(user);
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: token,
    };
  }
}
