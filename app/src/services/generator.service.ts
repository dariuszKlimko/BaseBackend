import { User } from "@app/entities/user.entity";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { randomInt } from "crypto";
import { Repository } from "typeorm";

@Injectable()
export class GeneratorSevice {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async codeGenerator(email: string): Promise<number> {
    const code = randomInt(100000, 999999);
    await this.userRepository.update({ email: email }, { verificationCode: code });
    return code;
  }

  verificationEmailText(email: string): string {
    const url = this.confirmationLinkGenerate(email);
    return `Hello ${email} \n\n Please verify your account by clicking the link: ${url} \n\n Thank You!\n`;
  }

  private confirmationLinkGenerate(email: string): string {
    const payload = { email };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get("JWT_CONFIRMATION_TOKEN_SECRET"),
      expiresIn: `${this.configService.get("JWT_CONFIRMATION_TOKEN_EXPIRATION_TIME")}s`,
    });
    return `${this.configService.get<string>("CONFIRMATION_HOST_NODEMAILER")}/auth/confirmation/${token}`;
  }

  resetPasswordEmailText(email: string, code: number): string {
    return `Hello ${email} \n\n Please reset your password with code: ${code} \n\n Thank You!\n`;
  }
}
