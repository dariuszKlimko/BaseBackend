import { NestFactory } from "@nestjs/core";
import { AppModule } from "@app/app.module";
import { configureHttpExceptionFilters, configureSwagger, configureValidator } from "@app/bootstrapConfiguration";
import { ConfigService } from "@nestjs/config";
import { INestApplication } from "@nestjs/common";

async function bootstrap(): Promise<void> {
  const app: INestApplication = await NestFactory.create(AppModule);

  const config: ConfigService = app.get(ConfigService);
  const port: number = config.get<number>("PORT");
  const docker_port: number = config.get<number>("DOCKER_PORT");

  configureSwagger(app);
  configureValidator(app);
  configureHttpExceptionFilters(app);

  await app.listen(port, () => console.log(`App listening on port ${port} or docker on ${docker_port}`));
}
bootstrap();
