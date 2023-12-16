import { Catch, ExecutionContext, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Request, Response } from "express";
import { ErrorResponse } from "@app/common/types/httpExceptionFilter";

@Catch(HttpException)
export class HttpExceptionFilter {
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

    Logger.error(`${request.method} ${request.url}`, JSON.stringify(errorResponse), "ExceptionFilter");

    response.status(status).json(errorResponse);
  }
}
