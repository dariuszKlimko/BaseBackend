import { Reflector } from "@nestjs/core";
import { BadRequestException, ClassSerializerInterceptor, INestApplication, ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { HttpExceptionFilter } from "@app/common/filter/http.exception.filter";
import { ConfigService } from "@nestjs/config";
import { MailerOptions } from "@nestjs-modules/mailer";
import { JwtModuleOptions } from "@nestjs/jwt";
import { dataBaseConfig } from "@app/data.source";
import { DataSourceOptions } from "typeorm";

export function configureSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle("Health API")
    .setDescription("Health API")
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

export async function configureMailerModule(configService: ConfigService): Promise<MailerOptions> {
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

export async function configureJwtModule(configService: ConfigService): Promise<JwtModuleOptions> {
  return {
    secret: configService.get<string>("JWT_SECRET"),
    signOptions: { expiresIn: `${configService.get<string>("JWT_EXPIRATION")}s` },
  };
}

export async function configureTypeORMModule(configService: ConfigService): Promise<DataSourceOptions> {
  return dataBaseConfig(configService.get("NODE_ENV"));
}
