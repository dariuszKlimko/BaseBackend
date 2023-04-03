import { UsersService } from "@app/services/user.service";
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { UserNotFoundException } from "@app/common/exceptions/userNotFound.exception";
import { UserNotVerifiedException } from "@app/common/exceptions/auth/userNotVerified.exception";

@Injectable()
export class EmailGuard implements CanActivate {
  constructor(private readonly userService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const body = context.switchToHttp().getRequest().body;
    try {
      const user = await this.userService.getUserByEmail(body.email);
      return !!user;
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        throw new NotFoundException(error.message);
      } else if (error instanceof UserNotVerifiedException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }
}
