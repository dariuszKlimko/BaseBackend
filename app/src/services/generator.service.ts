import { RESET_PASSWORD_MESSAGE, VERIFICATION_EMAIL_MESSAGE } from "@app/common/constans/constans";
import { User } from "@app/entities/user.entity";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { randomBytes, randomInt } from "crypto";
import { Repository } from "typeorm";

@Injectable()
export class GeneratorSevice {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async codeGenerator(email: string): Promise<number> {
    const code: number = randomInt(100000, 999999);
    await this.userRepository.update({ email: email }, { verificationCode: code });
    return code;
  }

  confirmationLinkGenerate(email: string): string {
    const payload = { email };
    const token: string = this.jwtService.sign(payload, {
      secret: this.configService.get("JWT_CONFIRMATION_TOKEN_SECRET"),
      expiresIn: `${this.configService.get("JWT_CONFIRMATION_TOKEN_EXPIRATION_TIME")}s`,
    });
    return `${this.configService.get<string>("CONFIRMATION_HOST_NODEMAILER")}${token}`;
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
