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
import { UsersService } from "@app/services/user.service";

@Injectable()
export class RolesGuard implements CanActivate {
  private reflector: Reflector;
  private readonly tokenService: TokenService;
  private readonly userService: UsersService;

  constructor(reflector: Reflector, tokenService: TokenService, userService: UsersService) {
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
      const user: User = await this.userService.getUser(userId);
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
