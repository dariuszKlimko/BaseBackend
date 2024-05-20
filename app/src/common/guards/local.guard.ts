import { User } from "@app/entities/user.entity";
import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UserAuthenticateException } from "@app/common/exceptions/auth/user.authenticate.exception";

@Injectable()
export class LocalGuard extends AuthGuard("local") {
  handleRequest<TUser = User>(error: Error, user: TUser, info: Error): TUser {
    if (error instanceof UserAuthenticateException) {
      throw new UnauthorizedException(error.message);
    } else if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }
}
