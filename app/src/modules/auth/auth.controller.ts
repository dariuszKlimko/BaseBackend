import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UseFilters,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "@app/modules/auth/auth.service";
import { CurrentUser } from "@app/common/decorators/currentUser.decorator";
import { HttpExceptionFilter } from "@app/common/filter/HttpException.filter";
import { CreateUserDto } from "@app/modules/user/dto/create-user.dto";
import { LoginResponse } from "@app/modules/auth/types/loginResponse";
import { UserNotFoundException } from "@app/common/types/userNotFound.exception";
import { UserAuthenticateException } from "@app/modules/auth/exceptions/userAuthenticate.exception";
import { UserNotVerifiedException } from "@app/modules/auth/exceptions/userNotVerified.exception";
import { IncorrectVerificationCode } from "@app/modules/auth/exceptions/incorrectVerificationCode.exception";
import { MessageInfo } from "@app/common/types/messageInfo";
import { JwtAuthGuard } from "@app/common/guards/jwt-auth.guard";
import { InvalidRefreshTokenException } from "@app/modules/auth/exceptions/invalidRefreshToken.exception";
import { CurrentUserDecorator } from "@app/common/types/currentUserDecorator";
import { LogoutResponse } from "@app/modules/auth/types/logoutResponse";
import { Token } from "@app/modules/auth/types/token";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseFilters(HttpExceptionFilter)
  @Get("/confirmation/:verificationCode")
  async userConfirmation(@Param("verificationCode") verificationCode: string): Promise<MessageInfo> {
    try {
      return await this.authService.userConfirmation(verificationCode);
    } catch (error) {
      if (error instanceof IncorrectVerificationCode) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @UseFilters(HttpExceptionFilter)
  @Post()
  async login(@Body() user: CreateUserDto): Promise<LoginResponse> {
    try {
      return await this.authService.login(user);
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        throw new NotFoundException(error.message);
      } else if (error instanceof UserAuthenticateException) {
        throw new UnauthorizedException(error.message);
      } else if (error instanceof UserNotVerifiedException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @UseFilters(HttpExceptionFilter)
  @Patch()
  async logout(@CurrentUser() user: CurrentUserDecorator, @Body() token: Token): Promise<LogoutResponse> {
    try {
      return await this.authService.logout(user.id, token.refreshToken);
    } catch (error) {
      if (error instanceof InvalidRefreshTokenException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @UseFilters(HttpExceptionFilter)
  @Post("/tokens")
  async getNewTokens(@Body() token: Token): Promise<LoginResponse> {
    try {
      return await this.authService.getNewToken(token.refreshToken);
    } catch (error) {
      if (error instanceof InvalidRefreshTokenException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
