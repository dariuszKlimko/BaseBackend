import { User } from "@app/entities/user.entity";
import { TokenService } from "@app/services/token.service";
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { EntityNotFound } from "@app/common/exceptions/base/entityNotFound.exception";

@Injectable()
export class RolesGuard implements CanActivate {
  private reflector: Reflector;
  private readonly tokenService: TokenService;

  constructor(reflector: Reflector, tokenService: TokenService) {
    this.reflector = reflector;
    this.tokenService = tokenService;
  }
    
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>("roles", context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    const token: string = authorization.split(" ")[1];
    try {
      const user: User = await this.tokenService.findUserByRefreshToken(token);
      return roles.includes(user.role);
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw new UnauthorizedException(error.message);
      }
      else if (error instanceof EntityNotFound) {
        throw new NotFoundException(error.message);
      }
    }
  }
}