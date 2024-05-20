import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { User } from "@app/entities/user.entity";
import { EntityNotFound } from "@app/common/exceptions/entity.not.found.exception";
import { AuthServiceIntrface } from "@app/common/types/interfaces/services/auth.service.interface";
import { AuthService } from "@app/services/auth.service";
import { UserAuthenticateException } from "@app/common/exceptions/auth/user.authenticate.exception";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly authService: AuthServiceIntrface;

  constructor(authService: AuthService) {
    super({ usernameField: "email" });
    this.authService = authService;
  }

  async validate(email: string, password: string): Promise<User> {
    try {
      const user: User = await this.authService.comparePassword({ email, password });
      return user;
    } catch (error) {
      if (error instanceof EntityNotFound) {
        throw new NotFoundException(error.message);
      } else if (error instanceof UserAuthenticateException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }
}
