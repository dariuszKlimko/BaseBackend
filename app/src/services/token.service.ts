import { InvalidRefreshTokenException } from "@app/common/exceptions/auth/invalidRefreshToken.exception";
import { LoginResponse } from "@app/common/types/auth/login-response";
import { User } from "@app/entities/user.entity";
import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { randomBytes } from "crypto";
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

  async findRefreshToken(refreshToken: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { refreshTokens: ArrayContains([refreshToken]) } });
    if (!user) {
      throw new InvalidRefreshTokenException("invalid refreshToken");
    }
    const tokenIndex = user.refreshTokens.indexOf(refreshToken);
    user.refreshTokens.splice(tokenIndex, 1);
    return user;
  }

  async tokensResponse(user: User): Promise<LoginResponse> {
    const payload = { sub: user.id };
    const token = this.generateToken();
    user.password = undefined;
    user.refreshTokens.push(token);
    await this.userRepository.save(user);
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: token,
    };
  }

  private generateToken(): string {
    return randomBytes(64).toString("hex");
  }
}
