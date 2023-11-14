import { Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

export class LoggerMiddleware implements NestMiddleware {
    private logger: Logger = new Logger('HTTP');

    use(request: Request, response: Response, next: NextFunction): void {
        const {ip, method, originalUrl} = request;
        const userAgent = request.get("user-agent") || "";

        response.on("finish", () => {
            const { statusCode } =  request;
            const contentLength = response.get("content-length");

            this.logger.debug(
                `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`
            );

            if (method !== "GET") {
                this.logger.debug(request.body);
            }
        })

        next();
    }
}