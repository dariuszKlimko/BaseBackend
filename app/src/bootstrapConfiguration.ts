import { Reflector } from "@nestjs/core";
import { BadRequestException, ClassSerializerInterceptor, INestApplication, ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { HttpExceptionFilter } from "@app/common/filter/HttpException.filter";

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
      exceptionFactory: (validationErrors) =>
        new BadRequestException({ type: "validation_error", data: validationErrors }),
    })
  );
}

export function configureHttpExceptionFilters(app: INestApplication): void {
  app.useGlobalFilters(new HttpExceptionFilter());
}
