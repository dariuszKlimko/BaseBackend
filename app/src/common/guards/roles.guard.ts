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
import { EntityNotFound } from "@app/common/exceptions/entityNotFound.exception";
import { Request } from "express";

@Injectable()
export class RolesGuard implements CanActivate {
  private reflector: Reflector;
  private readonly tokenService: TokenService;

  constructor(reflector: Reflector, tokenService: TokenService) {
    this.reflector = reflector;
    this.tokenService = tokenService;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles: string[] = this.reflector.get<string[]>("roles", context.getHandler());
    if (!roles) {
      return true;
    }
    const request: Request = context.switchToHttp().getRequest<Request>();
    const authorization: string = request.headers.authorization;
    const token: string = authorization.split(" ")[1];
    try {
      const user: User = await this.tokenService.findUserByRefreshToken(token);
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
