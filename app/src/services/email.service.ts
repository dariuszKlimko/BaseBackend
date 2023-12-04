import { UserNotVerifiedException } from "@app/common/exceptions/auth/userNotVerified.exception";
import { User } from "@app/entities/user.entity";
import { UserRepositoryIntrface } from "@app/repositories/interfaces/user.repository.interface";
import { UserRepository } from "@app/repositories/user.repository";
import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EmailService {
  private readonly userRepository: UserRepositoryIntrface;
  private readonly configService: ConfigService;
  private readonly mailerService: MailerService

  constructor(
    userRepository: UserRepository,  
    configService: ConfigService,
    mailerService: MailerService,
  ) {
    this.userRepository = userRepository;
    this.configService = configService;
    this.mailerService = mailerService;
  }

  async checkIfEmailExist(email: string): Promise<User> {
   return await this.userRepository.findOneByConditionOrThrow({ email });
  }

  async checkIfEmailVerified(email: string): Promise<User> {
    const user: User = await this.userRepository.findOneByConditionOrThrow({ email });
    if (!user.verified) {
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

// @Injectable()
// export class EmailService {
//   constructor(
//     @InjectRepository(User) private userRepository: Repository<User>,
//     private readonly configService: ConfigService,
//     private readonly mailerService: MailerService
//   ) {}

//   async checkIfEmailExist(email: string): Promise<User> {
//     const user: User = await this.userRepository.findOneBy({ email });
//     if (!user) {
//       throw new UserNotFoundException("user with given email address not exist in database");
//     }
//     return user;
//   }

//   async checkIfEmailVerified(email: string): Promise<User> {
//     const user: User = await this.userRepository.findOneBy({ email });
//     if (!user) {
//       throw new UserNotFoundException("user with given email address not exist in database");
//     } else if (!user.verified) {
//       throw new UserNotVerifiedException("user with given email is not verified");
//     }
//     return user;
//   }

//   async sendEmail(email: string, text: string, subject: string): Promise<void> {
//     await this.mailerService.sendMail({
//       to: email,
//       from: this.configService.get<string>("EMAIL_NODEMAILER"),
//       subject,
//       text,
//     });
//   }
// }
