import { User } from "@app/entities/user.entity";

export interface GeneratorServiceIntrface {
  confirmationLinkGenerate(email: string): string;
  codeGenerator(): number;
  verificationEmailText(email: string, url: string): string;
  resetPasswordEmailText(email: string, code: number): string;
  generateRefreshToken(): string;
  generateAccessToken(user: User): string;
}
