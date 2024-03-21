import {
  Injectable,
  CanActivate,
  ExecutionContext,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { EmailService } from "@app/services/email.service";
import { EntityNotFound } from "@app/common/exceptions/entity.not.found.exception";
import { User } from "@app/entities/user.entity";
import { Request } from "express";
import { EmailServiceIntrface } from "@app/common/types/interfaces/services/email.service.interface";

@Injectable()
export class EmailExistGuard implements CanActivate {
  private readonly emailService: EmailServiceIntrface;

  constructor(emailService: EmailService) {
    this.emailService = emailService;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest<Request>();
    const email: string = request.body.email;
    try {
      const user: User = await this.emailService.checkIfEmailExist(email);
      return !!user;
    } catch (error) {
      if (error instanceof EntityNotFound) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }
}
