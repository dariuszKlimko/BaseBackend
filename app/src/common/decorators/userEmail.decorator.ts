import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const UserEmail = createParamDecorator(async (data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user.email;
});
