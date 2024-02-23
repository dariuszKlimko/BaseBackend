import { USER_WITH_GIVEN_EMAIL_IS_NOT_VERIFIED } from "@app/common/constans/exceptions.constans";
import { UserNotVerifiedException } from "@app/common/exceptions/auth/user.not.verified.exception";
import { User } from "@app/entities/user.entity";
import { MailerService } from "@nestjs-modules/mailer";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EmailServiceIntrface } from "@app/common/types/interfaces/services/email.service.interface";
import { UserService } from "@app/services/user.service";
import { UserServiceIntrface } from "@app/common/types/interfaces/services/user.service.interface";

@Injectable()
export class EmailService implements EmailServiceIntrface {
  private readonly logger: Logger = new Logger(EmailService.name);
  private readonly userService: UserServiceIntrface;
  private readonly configService: ConfigService;
  private readonly mailerService: MailerService;

  constructor(userService: UserService, configService: ConfigService, mailerService: MailerService) {
    this.userService = userService;
    this.configService = configService;
    this.mailerService = mailerService;
  }

  async checkIfEmailExist(email: string): Promise<User> {
    return await this.userService.findOneByConditionOrThrow({ email });
  }

  async checkIfEmailVerified(email: string): Promise<User> {
    const user: User = await this.userService.findOneByConditionOrThrow({ email });
    if (!user.verified) {
      throw new UserNotVerifiedException(USER_WITH_GIVEN_EMAIL_IS_NOT_VERIFIED);
    }
    return user;
  }

  async sendEmail(email: string, text: string, subject: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      from: this.configService.get<string>("EMAIL_NODEMAILER"),
      subject,
      text,
    });
  }
}
