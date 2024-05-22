import { Catch, ExecutionContext, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Request, Response } from "express";
import { ErrorResponse } from "@app/common/types/type/httpExceptionFilter";

@Catch(HttpException)
export class HttpExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  catch(exception: HttpException, context: ExecutionContext): void {
    const request: Request = context.switchToHttp().getRequest<Request>();
    const response: Response = context.switchToHttp().getResponse<Response>();
    const status: number =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse: ErrorResponse = {
      code: status,
      timestamp: new Date().toLocaleDateString(),
      path: request.url,
      method: request.method,
      message: exception.message || null,
    };

    this.logger.error(`${request.method} ${request.url}`, JSON.stringify(errorResponse));
    response.status(status).json(errorResponse);
  }
}
