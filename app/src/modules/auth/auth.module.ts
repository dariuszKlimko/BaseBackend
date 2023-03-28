import { Module } from "@nestjs/common";
import { AuthService } from "@app/modules/auth/auth.service";
import { ConfigService } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "@app/modules/user/entities/user.entity";
import { AuthController } from "@app/modules/auth/auth.controller";
import { JwtStrategy } from "@app/modules/auth/jwt.strategy";
import { EmailService } from "@app/modules/email/email.service";
import { UsersService } from "@app/modules/user/user.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>("JWT_SECRET"),
          signOptions: { expiresIn: "900s" },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, EmailService, UsersService],
  exports: [AuthService],
})
export class AuthModule {}
