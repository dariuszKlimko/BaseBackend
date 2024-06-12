import { NestFactory } from "@nestjs/core";
import { AppModule } from "@app/app.module";
import { configureHttpExceptionFilters, configureSwagger, configureValidator } from "@app/bootstrap.configuration";
import { ConfigService } from "@nestjs/config";
import { INestApplication, Logger } from "@nestjs/common";
import cookieParser from "cookie-parser";
import * as fs from 'fs';
import path from "path";

const httpsOptions = {
  key: fs.readFileSync(path.resolve("C:/Users/darek/Desktop/ssl/key.pem")),
  cert: fs.readFileSync(path.resolve("C:/Users/darek/Desktop/ssl/cert.pem")),
};

async function bootstrap(): Promise<void> {
  // const app: INestApplication = await NestFactory.create(AppModule, {
  //   httpsOptions,
  // });
  const app: INestApplication = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const config: ConfigService = app.get(ConfigService);
  const port: number = config.get<number>("PORT");
  const docker_port: number = config.get<number>("DOCKER_PORT");

  configureSwagger(app);
  configureValidator(app);
  configureHttpExceptionFilters(app);

  await app.listen(port, () => Logger.log(`App listening on port ${port} or docker on ${docker_port}`));
}
bootstrap();
// yarn migration:generate ./src/migrations/name
