import { User } from "@app/entities/user.entity";
import { SentMessageInfo } from "nodemailer";

export interface EmailServiceIntrface {
  checkIfEmailExist(email: string): Promise<User>;
  checkIfEmailVerified(email: string): Promise<User>;
  sendEmail(email: string, text: string, subject: string): Promise<SentMessageInfo>;
}
