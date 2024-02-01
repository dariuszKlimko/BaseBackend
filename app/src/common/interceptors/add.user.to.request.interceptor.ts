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
import { EntityNotFound } from "@app/common/exceptions/entity.not.found.exception";
import { UserService } from "@app/services/user.service";
import { Request } from "express";
import { TokenService } from "@app/services/token.service";
import { UserServiceIntrface } from "@app/services/interfaces/user.service.interface";

@Injectable()
export class AddUserToRequest implements NestInterceptor {
  private readonly userService: UserServiceIntrface;
  private readonly tokenService: TokenService;

  constructor(userService: UserService, tokenService: TokenService) {
    this.userService = userService;
    this.tokenService = tokenService;
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<void>> {
    const request: Request = context.switchToHttp().getRequest<Request>();
    if (request.headers.authorization) {
      const authorization: string = request.headers.authorization;
      const accessToken: string = authorization.split(" ")[1];
      const userId: string = this.tokenService.decodeJWTtoken(accessToken).sub;
      try {
        const user: User = await this.userService.findOneByIdOrThrow(userId);
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
