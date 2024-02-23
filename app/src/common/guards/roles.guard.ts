import { User } from "@app/entities/user.entity";
import { TokenService } from "@app/services/token.service";
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { EntityNotFound } from "@app/common/exceptions/entity.not.found.exception";
import { Request } from "express";
import { UserService } from "@app/services/user.service";
import { TokenServiceIntrface } from "@app/common/types/interfaces/services/token.service.interface";
import { UserServiceIntrface } from "@app/common/types/interfaces/services/user.service.interface";

@Injectable()
export class RolesGuard implements CanActivate {
  private reflector: Reflector;
  private readonly tokenService: TokenServiceIntrface;
  private readonly userService: UserServiceIntrface;

  constructor(reflector: Reflector, tokenService: TokenService, userService: UserService) {
    this.reflector = reflector;
    this.tokenService = tokenService;
    this.userService = userService;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles: string[] = this.reflector.get<string[]>("roles", context.getHandler());
    if (!roles) {
      return true;
    }
    const request: Request = context.switchToHttp().getRequest<Request>();
    const authorization: string = request.headers.authorization;
    const accessToken: string = authorization.split(" ")[1];
    try {
      const userId: string = await this.tokenService.decodeJWTtoken(accessToken).sub;
      const user: User = await this.userService.findOneByIdOrThrow(userId);
      if (!roles.includes(user.role)) {
        throw new ForbiddenException("User unauthorized.");
      }
      return roles.includes(user.role);
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw new UnauthorizedException(error.message);
      } else if (error instanceof EntityNotFound) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }
}
