import { Reflector } from "@nestjs/core";
import { BadRequestException, ClassSerializerInterceptor, INestApplication, ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { HttpExceptionFilter } from "@app/common/filters/http.exception.filter";
import { ConfigService } from "@nestjs/config";
import { MailerOptions } from "@nestjs-modules/mailer";
import { JwtModuleOptions } from "@nestjs/jwt";
import { dataBaseConfig } from "@app/data.source";
import { DataSourceOptions } from "typeorm";
import { ThrottlerModuleOptions } from "@nestjs/throttler";

export function configureSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle("BaseBackend API")
    .setDescription("BaseBackend API")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("/api", app, document);
}

export function configureValidator(app: INestApplication): void {
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: (validationErrors) =>
        new BadRequestException({
          type: "validation error",
          data: validationErrors,
          message: "data validation error",
        }),
    })
  );
}

export function configureHttpExceptionFilters(app: INestApplication): void {
  app.useGlobalFilters(new HttpExceptionFilter());
}

export function configureThrotllerModule(configService: ConfigService): ThrottlerModuleOptions {
  return [
    {
      ttl: configService.get("THROTTLE_TTL"),
      limit: configService.get("THROTTLE_LIMIT"),
    },
  ];
}

export function configureMailerModule(configService: ConfigService): MailerOptions {
  return {
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
  };
}

export function configureJwtModule(configService: ConfigService): JwtModuleOptions {
  return {
    secret: configService.get<string>("JWT_SECRET"),
    signOptions: { expiresIn: `${configService.get<string>("JWT_EXPIRATION")}s` },
  };
}

export function configureTypeORMModule(configService: ConfigService): DataSourceOptions {
  return dataBaseConfig(configService.get("NODE_ENV"));
}
