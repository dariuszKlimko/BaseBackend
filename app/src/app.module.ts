import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppConfigModule } from "@app/config.module";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { MailerModule } from "@nestjs-modules/mailer";
import { LoggerMiddleware } from "@app/common/loggers/logger.midleware";
import { configureJwtModule, configureMailerModule, configureTypeORMModule } from "@app/bootstrapConfiguration";

import { default as Strategies } from "@app/common/strategies";
import { default as Entities } from "@app/entities";
import { default as Repositories } from "@app/repositories";
import { default as Services } from "@app/services";
import { default as Controllers } from "@app/controllers";

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: configureMailerModule,
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      useFactory: configureJwtModule,
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: configureTypeORMModule,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([...Entities]),
    PassportModule,
    AppConfigModule,
  ],
  controllers: [...Controllers],
  providers: [...Services, ...Strategies, ...Repositories],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
