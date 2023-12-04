import {
  Injectable,
  CanActivate,
  ExecutionContext,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { UserNotVerifiedException } from "@app/common/exceptions/auth/userNotVerified.exception";
import { EmailService } from "@app/services/email.service";
import { EntityNotFound } from "@app/common/exceptions/base/entityNotFound.exception";

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  private readonly emailService: EmailService;

  constructor(emailService: EmailService) {
    this.emailService = emailService;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const body = context.switchToHttp().getRequest().body;
    try {
      const user = await this.emailService.checkIfEmailVerified(body.email);
      return !!user;
    } catch (error) {
      if (error instanceof EntityNotFound) {
        throw new NotFoundException(error.message);
      } else if (error instanceof UserNotVerifiedException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }
}
