import { UsersService } from "@app/services/user.service";
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { UserNotFoundException } from "@app/common/exceptions/userNotFound.exception";

@Injectable()
export class EmailExistGuard implements CanActivate {
  constructor(private readonly userService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const body = context.switchToHttp().getRequest().body;
    try {
      const user = await this.userService.checkIfEmailExist(body.email);
      return !!user;
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }
}
