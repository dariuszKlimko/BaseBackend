import {
  Injectable,
  CanActivate,
  ExecutionContext,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { EmailService } from "@app/services/email.service";
import { EntityNotFound } from "@app/common/exceptions/base/entityNotFound.exception";

@Injectable()
export class EmailExistGuard implements CanActivate {
  private readonly emailService: EmailService;

  constructor(emailService: EmailService) {
    this.emailService= emailService;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const body = context.switchToHttp().getRequest().body;
    try {
      const user = await this.emailService.checkIfEmailExist(body.email);
      return !!user;
    } catch (error) {
      if (error instanceof EntityNotFound) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }
}
