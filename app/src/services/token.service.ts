import {
  BAD_CONFIRMATION_TOKEN,
  CONFIRMATION_TOKEN_EXPIRED,
  INVALID_REFRESH_TOKEN,
} from "@app/common/constans/exceptions.constans";
import { User } from "@app/entities/user.entity";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload, jwtDecode } from "jwt-decode";
import { ArrayContains } from "typeorm";
import { TokenServiceIntrface } from "@app/common/types/interfaces/services/token.service.interface";
import { InvalidRefreshTokenException } from "@app/common/exceptions/auth/invalid.refresh.token.exception";
import { LogoutResponse } from "@app/dtos/auth/logout.response";
import { UserServiceIntrface } from "@app/common/types/interfaces/services/user.service.interface";
import { UserService } from "@app/services/user.service";

@Injectable()
export class TokenService implements TokenServiceIntrface {
  private readonly logger: Logger = new Logger(TokenService.name);
  private readonly userService: UserServiceIntrface;
  private readonly jwtService: JwtService;
  private readonly configService: ConfigService;

  constructor(userService: UserService, jwtService: JwtService, configService: ConfigService) {
    this.userService = userService;
    this.jwtService = jwtService;
    this.configService = configService;
  }

  async decodeConfirmationToken(confirmationToken: string): Promise<string> {
    try {
      const payload: JwtService = await this.jwtService.verify(confirmationToken, {
        secret: this.configService.get("JWT_CONFIRMATION_TOKEN_SECRET"),
      });
      if (typeof payload === "object" && "email" in payload) {
        return payload.email.toString();
      }
      throw new BadRequestException();
    } catch (error) {
      if (error?.name === "TokenExpiredError") {
        throw new BadRequestException(CONFIRMATION_TOKEN_EXPIRED);
      }
      throw new BadRequestException(BAD_CONFIRMATION_TOKEN);
    }
  }

  async findUserByRefreshToken(refreshToken: string): Promise<User> {
    const user: User = await this.userService.findOneByConditionOrThrow({
      refreshTokens: ArrayContains([refreshToken]),
    });
    return user;
  }

  async deleteRefreshTokenFromUser(user: User, refreshToken: string): Promise<void> {
    const tokenIndex: number = user.refreshTokens.indexOf(refreshToken);
    if (tokenIndex < 0) {
      throw new InvalidRefreshTokenException(INVALID_REFRESH_TOKEN);
    }
    user.refreshTokens.splice(tokenIndex, 1);
    await this.userService.updateOne(user.id, { refreshTokens: user.refreshTokens });
  }

  async deleteAllRefreshTokensFromUser(id: string): Promise<LogoutResponse> {
    const user: User = await this.userService.findOneByIdOrThrow(id);
    user.refreshTokens = [];
    await this.userService.updateOne(user.id, { refreshTokens: user.refreshTokens });
    return { email: user.email };
  }

  async saveRefreshTokenToUser(user: User, refreshToken: string): Promise<string> {
    user.refreshTokens.push(refreshToken);
    await this.userService.updateOne(user.id, { refreshTokens: user.refreshTokens });
    return refreshToken;
  }

  decodeJWTtoken(accessToken: string): JwtPayload {
    return jwtDecode(accessToken);
  }
}
