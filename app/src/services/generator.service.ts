import { RESET_PASSWORD_MESSAGE, VERIFICATION_EMAIL_MESSAGE } from "@app/common/constans/constans";
import { LinkGeneratePayload } from "@app/common/types/linkGeneratePayload";
import { TokenResponsePayload } from "@app/common/types/tokenResponsePayload";
import { User } from "@app/entities/user.entity";
import { UserRepositoryIntrface } from "@app/repositories/interfaces/user.repository.interface";
import { UserRepository } from "@app/repositories/user.repository";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { randomBytes, randomInt } from "crypto";
import { GeneratorServiceIntrface } from "@app/services/interfaces/generator.service.interface";

@Injectable()
export class GeneratorSevice implements GeneratorServiceIntrface {
  private readonly userRepository: UserRepositoryIntrface;
  private readonly jwtService: JwtService;
  private readonly configService: ConfigService;

  constructor(userRepository: UserRepository, jwtService: JwtService, configService: ConfigService) {
    this.userRepository = userRepository;
    this.jwtService = jwtService;
    this.configService = configService;
  }

  confirmationLinkGenerate(email: string): string {
    const payload: LinkGeneratePayload = { email };
    const confirmationToken: string = this.jwtService.sign(payload, {
      secret: this.configService.get("JWT_CONFIRMATION_TOKEN_SECRET"),
      expiresIn: `${this.configService.get("JWT_CONFIRMATION_TOKEN_EXPIRATION_TIME")}s`,
    });
    return `${this.configService.get<string>("CONFIRMATION_HOST_NODEMAILER")}${confirmationToken}`;
  }

  async codeGenerator(email: string): Promise<number> {
    const code: number = randomInt(100000, 999999);
    const user: User = await this.userRepository.findOneByConditionOrThrow({ email: email });
    await this.userRepository.updateOne(user.id, { verificationCode: code });
    return code;
  }

  verificationEmailText(email: string, url: string): string {
    return VERIFICATION_EMAIL_MESSAGE(email, url);
  }

  resetPasswordEmailText(email: string, code: number): string {
    return RESET_PASSWORD_MESSAGE(email, code);
  }

  generateRefreshToken(): string {
    return randomBytes(64).toString("hex");
  }

  generateAccessToken(user: User): string {
    const payload: TokenResponsePayload = { sub: user.id };
    return this.jwtService.sign(payload);
  }
}
