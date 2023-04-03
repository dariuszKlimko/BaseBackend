import { Module } from "@nestjs/common";
import { AppConfigModule } from "@app/common/config/config.module";
import { UsersController } from "@app/controllers/users.controller";
import { MeasurementsController } from "@app/controllers/measurements.controller";
import { AuthController } from "@app/controllers/auth.controller";
import { UsersService } from "@app/services/user.service";
import { MeasurementsService } from "@app/services/measurements.service";
import { AuthService } from "@app/services/auth.service";
import { EmailService } from "@app/services/email.service";
import { JwtModule } from "@nestjs/jwt";
import { User } from "@app/entities/user/user.entity";
import { Measurement } from "@app/entities/measurement/measurement.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { dataBaseConfig } from "@app/data-source";
import { PassportModule } from "@nestjs/passport";
import { MailerModule } from "@nestjs-modules/mailer";
import { JwtStrategy } from "@app/common/strategies/jwt.strategy";

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        transport: {
          service: configService.get("SERVICE_NODEMAILER"),
          secure: true,
          auth: {
            user: configService.get("EMAIL_NODEMAILER"),
            pass: configService.get("PASSWORD_NODEMAILER"),
          },
        },
        defaults: {
          from: `No Reply <${configService.get("EMAIL_NODEMAILER")}>`,
        },
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>("JWT_SECRET"),
          signOptions: { expiresIn: `${configService.get<string>("JWT_EXPIRATION")}s` },
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (serviceConfig: ConfigService) => dataBaseConfig(serviceConfig.get("NODE_ENV")),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Measurement]),
    PassportModule,
    AppConfigModule,
  ],
  controllers: [UsersController, MeasurementsController, AuthController],
  providers: [UsersService, MeasurementsService, AuthService, EmailService, JwtStrategy],
})
export class AppModule {}
