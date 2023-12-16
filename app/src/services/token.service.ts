import { BAD_CONFIRMATION_TOKEN, CONFIRMATION_TOKEN_EXPIRED } from "@app/common/constans/exceptions.constans";
import { TokenResponsePayload } from "@app/common/types/tokenResponsePayload";
import { LoginResponse } from "@app/dtos/auth/login.response";
import { User } from "@app/entities/user.entity";
import { UserRepositoryIntrface } from "@app/repositories/interfaces/user.repository.interface";
import { UserRepository } from "@app/repositories/user.repository";
import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload, jwtDecode } from "jwt-decode";
import { ArrayContains } from "typeorm";

@Injectable()
export class TokenService {
  private readonly userRepository: UserRepositoryIntrface;
  private readonly jwtService: JwtService;
  private readonly configService: ConfigService;

  constructor(userRepository: UserRepository, jwtService: JwtService, configService: ConfigService) {
    this.userRepository = userRepository;
    this.jwtService = jwtService;
    this.configService = configService;
  }

  async decodeConfirmationToken(token: string): Promise<string> {
    try {
      const payload: JwtService = await this.jwtService.verify(token, {
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
    const user: User = await this.userRepository.findOneByConditionOrThrow({
      refreshTokens: ArrayContains([refreshToken]),
    });
    const tokenIndex: number = user.refreshTokens.indexOf(refreshToken);
    user.refreshTokens.splice(tokenIndex, 1);
    return user;
  }

  async tokensResponse(user: User, token: string): Promise<LoginResponse> {
    const payload: TokenResponsePayload = { sub: user.id };
    user.password = undefined;
    user.refreshTokens.push(token);
    await this.userRepository.saveOne(user);
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: token,
    };
  }

  decodeJWTtoken(token: string): JwtPayload {
    return jwtDecode(token);
  }
}
