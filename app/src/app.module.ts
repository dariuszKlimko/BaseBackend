import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppConfigModule } from "@app/config.module";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { MailerModule } from "@nestjs-modules/mailer";
import { RestLogger } from "@app/common/loggers/rest.logger.middleware";
import {
  configureJwtModule,
  configureMailerModule,
  configureThrotllerModule,
  configureTypeORMModule,
} from "@app/bootstrap.configuration";

import { default as Strategies } from "@app/common/strategies";
import { default as Entities } from "@app/entities";
import { default as Repositories } from "@app/repositories";
import { default as Services } from "@app/services";
import { default as Controllers } from "@app/controllers";
import { ThrottlerModule } from "@nestjs/throttler";

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: configureThrotllerModule,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: configureMailerModule,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: configureJwtModule,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: configureTypeORMModule,
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
    consumer.apply(RestLogger).forRoutes("*");
  }
}
