import { Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { LoggerDestructure } from "@app/common/types/type/loggerDestructureType";

export class RestLogger implements NestMiddleware {
  private logger: Logger = new Logger("HTTP");

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl, statusCode }: LoggerDestructure = request;
    const userAgent: string = request.get("user-agent") || "";
    response.on("finish", (): void => {
      const contentLength: string = response.get("content-length");

      this.logger.debug(`${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`);

      if (method !== "GET") {
        this.logger.debug(request.body);
      }
    });

    next();
  }
}
