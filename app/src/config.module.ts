import * as Joi from "joi";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        DOCKER_PORT: Joi.number().required(),
        NODE_ENV: Joi.string().required(),
        APP_HOST: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(5432).required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        PGADMIN_DEFAULT_EMAIL: Joi.string().email().required(),
        PGADMIN_DEFAULT_PASSWORD: Joi.string().required(),
        EMAIL_NODEMAILER: Joi.string().email().required(),
        PASSWORD_NODEMAILER: Joi.string().required(),
        SERVICE_NODEMAILER: Joi.string().required(),
        CONFIRMATION_HOST_NODEMAILER: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.number().required(),
        JWT_CONFIRMATION_TOKEN_SECRET: Joi.string().required(),
        JWT_CONFIRMATION_TOKEN_EXPIRATION_TIME: Joi.number().required(),
        THROTTLE_TTL: Joi.number().required(),
        THROTTLE_LIMIT: Joi.number().required(),
      }),
      envFilePath: "../.env",
      validationOptions: {
        abortEarly: true,
      },
      isGlobal: true,
    }),
  ],
})
export class AppConfigModule {}
