import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ArrayContains, Repository } from "typeorm";
import { User } from "@app/entities/user/user.entity";
import { CreateUserDto } from "@app/dtos/user/create-user.dto";
import { JwtService } from "@nestjs/jwt";
import { randomBytes } from "crypto";
import { UserAuthenticateException } from "@app/common/exceptions/auth/userAuthenticate.exception";
import { UserNotFoundException } from "@app/common/exceptions/userNotFound.exception";
import { UserNotVerifiedException } from "@app/common/exceptions/auth/userNotVerified.exception";
import { LoginResponse } from "@app/common/types/auth/login-response";
import { MessageInfo } from "@app/common/types/messageInfo";
import { InvalidRefreshTokenException } from "@app/common/exceptions/auth/invalidRefreshToken.exception";
import { LogoutResponse } from "@app/common/types/auth/logout-response";
import { ConfigService } from "@nestjs/config";
import { UserAlreadyConfirmedException } from "@app/common/exceptions/auth/userAlreadyConfirmed.exception";
import { UpdateCredentialsDto } from "@app/dtos/auth/update-creadentials.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async decodeConfirmationToken(token: string): Promise<string> {
    try {
      const payload = await this.jwtService.verify(token, {
        secret: this.configService.get("JWT_CONFIRMATION_TOKEN_SECRET"),
      });
      if (typeof payload === "object" && "email" in payload) {
        return payload.email;
      }
      throw new BadRequestException();
    } catch (error) {
      if (error?.name === "TokenExpiredError") {
        throw new BadRequestException("Email confirmation token expired");
      }
      throw new BadRequestException("Bad confirmation token");
    }
  }

  async userConfirmation(email: string): Promise<MessageInfo> {
    const userDb = await this.userRepository.findOneBy({ email });
    if (!userDb) {
      throw new UserNotFoundException("user with given email not exist in database");
    } else if (userDb.verified) {
      throw new UserAlreadyConfirmedException("user with given email is already confirmed");
    }
    await this.userRepository.update(userDb.id, { verified: true });
    return { status: "ok", message: "user successfully verified" };
  }

  async login(userInfo: CreateUserDto): Promise<LoginResponse> {
    const user = await this.userRepository.findOneBy({ email: userInfo.email });
    if (!user) {
      throw new UserNotFoundException("user with given email not exist in database");
    }
    const isMatch = await user.validatePassword(userInfo.password);
    if (!isMatch) {
      throw new UserAuthenticateException("incorrect email address or password");
    } else if (!user.verified) {
      throw new UserNotVerifiedException("user with given email is not verified");
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

  async updateCredentials(id: string, userInfo: UpdateCredentialsDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (userInfo.email) {
      user.email = userInfo.email;
    }
    if (user.password) {
      user.password = userInfo.password;
    }
    return await this.userRepository.save(user);
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
