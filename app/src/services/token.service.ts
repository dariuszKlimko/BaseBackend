import { BAD_CONFIRMATION_TOKEN, CONFIRMATION_TOKEN_EXPIRED } from "@app/common/constans/exceptions.constans";
import { User } from "@app/entities/user.entity";
import { UserRepositoryIntrface } from "@app/repositories/interfaces/user.repository.interface";
import { UserRepository } from "@app/repositories/user.repository";
import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload, jwtDecode } from "jwt-decode";
import { ArrayContains } from "typeorm";
import { TokenServiceIntrface } from "@app/services/interfaces/token.service.interface";

@Injectable()
export class TokenService implements TokenServiceIntrface {
  private readonly userRepository: UserRepositoryIntrface;
  private readonly jwtService: JwtService;
  private readonly configService: ConfigService;

  constructor(userRepository: UserRepository, jwtService: JwtService, configService: ConfigService) {
    this.userRepository = userRepository;
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
    const user: User = await this.userRepository.findOneByConditionOrThrow({
      refreshTokens: ArrayContains([refreshToken]),
    });
    const tokenIndex: number = user.refreshTokens.indexOf(refreshToken);
    user.refreshTokens.splice(tokenIndex, 1);
    return user;
  }

  async saveRefreshTokenToDB(user: User, refreshToken: string): Promise<string> {
    user.refreshTokens.push(refreshToken);
    await this.userRepository.updateOne(user.id, { refreshTokens: user.refreshTokens });
    return refreshToken;
  }

  decodeJWTtoken(accessToken: string): JwtPayload {
    return jwtDecode(accessToken);
  }
}
