import { EmailService } from "@app/modules/email/email.service";
import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { AuthModule } from "@app/modules/auth/auth.module";

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        transport: {
          service: config.get("SERVICE_NODEMAILER"),
          secure: true,
          auth: {
            user: config.get("EMAIL_NODEMAILER"),
            pass: config.get("PASSWORD_NODEMAILER"),
          },
        },
        defaults: {
          from: `No Reply <${config.get("EMAIL_NODEMAILER")}>`,
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
  ],
  providers: [EmailService, JwtService],
  exports: [EmailService],
})
export class EmailModule {}
