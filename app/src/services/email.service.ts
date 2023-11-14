import { UserNotVerifiedException } from "@app/common/exceptions/auth/userNotVerified.exception";
import { UserNotFoundException } from "@app/common/exceptions/userNotFound.exception";
import { User } from "@app/entities/user.entity";
import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService
  ) {}

  async checkIfEmailExist(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new UserNotFoundException("user with given email address not exist in database");
    }
    return user;
  }

  async checkIfEmailVerified(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new UserNotFoundException("user with given email address not exist in database");
    } else if (!user.verified) {
      throw new UserNotVerifiedException("user with given email is not verified");
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
