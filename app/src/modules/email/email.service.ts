import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService, private mailerService: MailerService) {}

  async sendEmail(email: string, code: string): Promise<void> {
    const result = await this.mailerService.sendMail({
      to: email,
      from: this.configService.get<string>("EMAIL_NODEMAILER"),
      subject: "Account confirmation ✔",
      text: `Hello ${email} \n\n Please verify your account by clicking the link:  ${this.configService.get<string>(
        "CONFIRMATION_HOST_NODEMAILER"
      )}/auth/confirmation/${code} \n\n Thank You!\n`,
    });
    return result;
  }
}
