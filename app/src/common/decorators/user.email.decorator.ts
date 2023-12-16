import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export const UserEmail = createParamDecorator((data: string, context: ExecutionContext): string => {
  const request: Request = context.switchToHttp().getRequest<Request>();
  return request.body.user.email;
});
