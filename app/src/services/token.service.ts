import { InvalidRefreshTokenException } from "@app/common/exceptions/auth/invalidRefreshToken.exception";
import { LoginResponse } from "@app/common/types/auth/login-response";
import { User } from "@app/entities/user.entity";
import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { ArrayContains, Repository } from "typeorm";

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

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
        throw new BadRequestException("Email confirmation token expired");
      }
      throw new BadRequestException("Bad confirmation token");
    }
  }

  async findUserByRefreshToken(refreshToken: string): Promise<User> {
    const user: User = await this.userRepository.findOne({
      where: { refreshTokens: ArrayContains([refreshToken]) },
    });
    if (!user) {
      throw new InvalidRefreshTokenException("invalid refreshToken");
    }
    const tokenIndex: number = user.refreshTokens.indexOf(refreshToken);
    user.refreshTokens.splice(tokenIndex, 1);
    return user;
  }

  async tokensResponse(user: User, token: string): Promise<LoginResponse> {
    const payload = { sub: user.id };
    user.password = undefined;
    user.refreshTokens.push(token);
    await this.userRepository.save(user);
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: token,
    };
  }
}
