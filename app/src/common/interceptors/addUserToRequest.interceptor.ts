import { User } from "@app/entities/user.entity";
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  NotFoundException,
  InternalServerErrorException,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { EntityNotFound } from "@app/common/exceptions/entityNotFound.exception";
import { UsersService } from "@app/services/user.service";
import { Request } from "express";
import { TokenService } from "@app/services/token.service";

@Injectable()
export class AddUserToRequest implements NestInterceptor {
  private readonly userService: UsersService;
  private readonly tokenService: TokenService;

  constructor(userService: UsersService, tokenService: TokenService) {
    this.userService = userService;
    this.tokenService = tokenService;
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<void>> {
    const request: Request = context.switchToHttp().getRequest<Request>();
    if (request.headers.authorization) {
      const authorization: string = request.headers.authorization;
      const token: string = authorization.split(" ")[1];
      const userId: string = this.tokenService.decodeJWTtoken(token).sub;
      try {
        const user: User = await this.userService.getUser(userId);
        request.body.user = user;
      } catch (error) {
        if (error instanceof EntityNotFound) {
          throw new NotFoundException(error.message);
        }
        throw new InternalServerErrorException();
      }
    }
    return next.handle();
  }
}
