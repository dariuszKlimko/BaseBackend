import { User } from "@app/entities/user.entity";
import { ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  handleRequest<TUser = User>(error: Error, user: TUser, info: Error, ctx: ExecutionContext): TUser {
    if ((info && info.name === "JsonWebTokenError") || (info && info.name === "TokenExpiredError")) {
      throw new UnauthorizedException("User unauthorized.");
    } else if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }
}
