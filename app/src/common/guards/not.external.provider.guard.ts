import {
  Injectable,
  CanActivate,
  ExecutionContext,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import { EntityNotFound } from "@app/common/exceptions/entity.not.found.exception";
import { User } from "@app/entities/user.entity";
import { Request } from "express";
import { AuthServiceIntrface } from "@app/common/types/interfaces/services/auth.service.interface";
import { AuthService } from "@app/services/auth.service";
import { ExternalProviderException } from "@app/common/exceptions/auth/external.provider.exception";
import { EmailServiceIntrface } from "@app/common/types/interfaces/services/email.service.interface";
import { EmailService } from "@app/services/email.service";

@Injectable()
export class NotExternalProviderGuard implements CanActivate {
  private readonly authService: AuthServiceIntrface;
  private readonly emailService: EmailServiceIntrface;

  constructor(authService: AuthService, emailService: EmailService) {
    this.authService = authService;
    this.emailService = emailService;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest<Request>();
    const email: string = request.body.email;
    try {
      this.emailService.checkIfEmail(email);
      const user: User = await this.authService.checkIfNotExternalProvider(email);
      return !!user;
    } catch (error) {
      if (error instanceof EntityNotFound) {
        throw new NotFoundException(error.message);
      } else if (error instanceof ExternalProviderException) {
        throw new UnauthorizedException(error.message);
      } else if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }
}
