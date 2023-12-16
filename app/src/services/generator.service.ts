import { RESET_PASSWORD_MESSAGE, VERIFICATION_EMAIL_MESSAGE } from "@app/common/constans/constans";
import { LinkGeneratePayload } from "@app/common/types/linkGeneratePayload";
import { UserRepositoryIntrface } from "@app/repositories/interfaces/user.repository.interface";
import { UserRepository } from "@app/repositories/user.repository";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { randomBytes, randomInt } from "crypto";

@Injectable()
export class GeneratorSevice {
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
    const token: string = this.jwtService.sign(payload, {
      secret: this.configService.get("JWT_CONFIRMATION_TOKEN_SECRET"),
      expiresIn: `${this.configService.get("JWT_CONFIRMATION_TOKEN_EXPIRATION_TIME")}s`,
    });
    return `${this.configService.get<string>("CONFIRMATION_HOST_NODEMAILER")}${token}`;
  }

  async codeGenerator(email: string): Promise<number> {
    const code: number = randomInt(100000, 999999);
    await this.userRepository.updateOneByCondition({ email: email }, { verificationCode: code });
    return code;
  }

  verificationEmailText(email: string, url: string): string {
    return VERIFICATION_EMAIL_MESSAGE(email, url);
  }

  resetPasswordEmailText(email: string, code: number): string {
    return RESET_PASSWORD_MESSAGE(email, code);
  }

  generateToken(): string {
    return randomBytes(64).toString("hex");
  }
}
