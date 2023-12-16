import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { AuthService } from "@app/services/auth.service";
import { UserId } from "@app/common/decorators/userId.decorator";
import { HttpExceptionFilter } from "@app/common/filter/HttpException.filter";
import { LoginResponse } from "@app/dtos/auth/login-response";
import { UserAuthenticateException } from "@app/common/exceptions/auth/userAuthenticate.exception";
import { MessageInfo } from "@app/dtos/auth/message-info-response";
import { JwtAuthGuard } from "@app/common/guards/jwt-auth.guard";
import { InvalidRefreshTokenException } from "@app/common/exceptions/auth/invalidRefreshToken.exception";
import { LogoutResponse } from "@app/dtos/auth/logout-response";
import { TokenDto } from "@app/dtos/auth/token.dto";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { LoginDto } from "@app/dtos/auth/login.dto";
import { EmailDto } from "@app/dtos/auth/email.dto";
import { EmailService } from "@app/services/email.service";
import { UserAlreadyConfirmedException } from "@app/common/exceptions/auth/userAlreadyConfirmed.exception";
import { User } from "@app/entities/user.entity";
import { UpdateCredentialsDto } from "@app/dtos/auth/update-creadentials.dto";
import { ResetPasswordDto } from "@app/dtos/auth/password-reset.dto";
import { InvalidVerificationCodeException } from "@app/common/exceptions/auth/invalidVerificationCode.exception ";
import { EmailVerifiedGuard } from "@app/common/guards/email-verified.guard";
import { EmailExistGuard } from "@app/common/guards/email-exist.guard";
import { TokenService } from "@app/services/token.service";
import { GeneratorSevice } from "@app/services/generator.service";
import {
  ACCOUTN_CONFIRMATION,
  RESEND_CONFIRMATION_RESPONSE,
  VVERIFICTION_CODE_RESPONSE,
  RESET_PASSWORD_VERIFICATION_CODE,
} from "@app/common/constans/constans";
import { EntityNotFound } from "@app/common/exceptions/entityNotFound.exception";
import { AddUserToRequest } from "@app/common/interceptors/addUserToRequest.interceptor";

@ApiTags("auth")
@UseFilters(HttpExceptionFilter)
@Controller("auth")
export class AuthController {
  private readonly authService: AuthService;
  private readonly emailService: EmailService;
  private readonly tokenService: TokenService;
  private readonly generatorService: GeneratorSevice;

  constructor(
    authService: AuthService,
    emailService: EmailService,
    tokenService: TokenService,
    generatorService: GeneratorSevice
  ) {
    this.authService = authService;
    this.emailService = emailService;
    this.tokenService = tokenService;
    this.generatorService = generatorService;
  }

  @ApiOperation({ summary: "account confirmation" })
  @ApiResponse({ status: 200, type: MessageInfo, description: "user has been successfully verified" })
  // @ApiOkResponse()
  // @ApiNotFoundResponse()
  // @ApiBadRequestResponse()
  // @ApiInternalServerErrorResponse()
  @Get("confirmation/:token")
  async userConfirmation(@Param("token") token: string): Promise<MessageInfo> {
    try {
      const email: string = await this.tokenService.decodeConfirmationToken(token);
      return await this.authService.userConfirmation(email);
    } catch (error) {
      if (error instanceof EntityNotFound) {
        throw new NotFoundException(error.message);
      } else if (error instanceof UserAlreadyConfirmedException) {
        throw new BadRequestException(error.message);
      } else if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "user registration" })
  @ApiResponse({ status: 201, type: MessageInfo, description: "confirmation email has been resend" })
  // @ApiCreatedResponse()
  // @ApiInternalServerErrorResponse()
  @UseGuards(EmailExistGuard)
  @UsePipes(ValidationPipe)
  @HttpCode(200)
  @Post("resend-confirmation")
  async resendConfirmationLink(@Body() userInfo: EmailDto): Promise<MessageInfo> {
    try {
      const confirmationLink: string = this.generatorService.confirmationLinkGenerate(userInfo.email);
      const text: string = this.generatorService.verificationEmailText(userInfo.email, confirmationLink);
      const subject: string = ACCOUTN_CONFIRMATION;
      await this.emailService.sendEmail(userInfo.email, text, subject);
      return RESEND_CONFIRMATION_RESPONSE;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "user login" })
  @ApiResponse({ status: 201, type: LoginResponse, description: "user has been successfully logged in" })
  // @ApiCreatedResponse()
  // @ApiUnauthorizedResponse()
  // @ApiInternalServerErrorResponse()
  @UseGuards(EmailVerifiedGuard)
  @UsePipes(ValidationPipe)
  @Post()
  async login(@Body() user: LoginDto): Promise<LoginResponse> {
    try {
      const authorizedUser: User = await this.authService.comparePassword(user);
      const newToken: string = this.generatorService.generateToken();
      return await this.tokenService.tokensResponse(authorizedUser, newToken);
    } catch (error) {
      if (error instanceof UserAuthenticateException) {
        throw new UnauthorizedException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "user logout" })
  @ApiResponse({ status: 200, type: LogoutResponse, description: "user has been successfully logged out" })
  // @ApiOkResponse()
  // @ApiInternalServerErrorResponse()
  @ApiBearerAuth()
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AddUserToRequest)
  @Patch()
  async logout(@UserId() userId: string, @Body() token: TokenDto): Promise<LogoutResponse> {
    try {
      return await this.authService.logout(userId, token.refreshToken);
    } catch (error) {
      if (error instanceof InvalidRefreshTokenException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "get new access and refresh tokens" })
  @ApiResponse({ status: 200, type: LoginResponse, description: "tokens has been successfully refreshed" })
  // @ApiOkResponse()
  // @ApiBadRequestResponse()
  // @ApiInternalServerErrorResponse()
  @UsePipes(ValidationPipe)
  @Patch("tokens")
  async getNewTokens(@Body() token: TokenDto): Promise<LoginResponse> {
    try {
      const authorizedUser: User = await this.tokenService.findUserByRefreshToken(token.refreshToken);
      const newToken: string = this.generatorService.generateToken();
      return await this.tokenService.tokensResponse(authorizedUser, newToken);
    } catch (error) {
      if (error instanceof EntityNotFound) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  @ApiOperation({ summary: "update credentials" })
  @ApiResponse({ status: 200, type: User, description: "credentials has been successfully updated" })
  // @ApiOkResponse()
  // @ApiInternalServerErrorResponse()
  @ApiBearerAuth()
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AddUserToRequest)
  @Patch("credentials")
  async updateCredentials(@UserId() userId: string, @Body() userInfo: UpdateCredentialsDto): Promise<User> {
    try {
      return await this.authService.updateCredentials(userId, userInfo);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "reset password" })
  @ApiResponse({ status: 200, type: MessageInfo, description: "verification code has been send" })
  // @ApiOkResponse()
  // @ApiInternalServerErrorResponse()
  @UsePipes(ValidationPipe)
  @UseGuards(EmailVerifiedGuard)
  @Patch("reset-password")
  async resetPassword(@Body() userInfo: EmailDto): Promise<MessageInfo> {
    try {
      const code: number = await this.generatorService.codeGenerator(userInfo.email);
      const text: string = this.generatorService.resetPasswordEmailText(userInfo.email, code);
      const subject: string = RESET_PASSWORD_VERIFICATION_CODE;
      await this.emailService.sendEmail(userInfo.email, text, subject);
      return VVERIFICTION_CODE_RESPONSE;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "reset password confirmation" })
  @ApiResponse({ status: 200, type: MessageInfo, description: "password has been reset" })
  // @ApiOkResponse()
  // @ApiBadRequestResponse()
  // @ApiInternalServerErrorResponse()
  @UsePipes(ValidationPipe)
  @UseGuards(EmailVerifiedGuard)
  @Patch("reset-password-confirm")
  async resetPasswordConfirm(@Body() resetPassword: ResetPasswordDto): Promise<MessageInfo> {
    try {
      return await this.authService.resetPasswordConfirm(resetPassword);
    } catch (error) {
      if (error instanceof InvalidVerificationCodeException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }
}
