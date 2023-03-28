import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class EmailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService
  ) {}

  async sendEmail(email: string): Promise<void> {
    const payload = { email };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get("JWT_CONFIRMATION_TOKEN_SECRET"),
      expiresIn: `${this.configService.get("JWT_CONFIRMATION_TOKEN_EXPIRATION_TIME")}s`,
    });
    const url = `${this.configService.get<string>("CONFIRMATION_HOST_NODEMAILER")}/auth/confirmation/${token}`;

    await this.mailerService.sendMail({
      to: email,
      from: this.configService.get<string>("EMAIL_NODEMAILER"),
      subject: "Account confirmation ✔",
      text: `Hello ${email} \n\n Please verify your account by clicking the link: ${url} \n\n Thank You!\n`,
    });
  }
}
