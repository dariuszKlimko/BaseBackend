import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { AuthService } from "@app/services/auth.service";
import { UserId } from "@app/common/decorators/user.id.decorator";
import { HttpExceptionFilter } from "@app/common/filter/http.exception.filter";
import { LoginResponse } from "@app/dtos/auth/login.response";
import { UserAuthenticateException } from "@app/common/exceptions/auth/user.authenticate.exception";
import { MessageInfo } from "@app/dtos/auth/message.info.response";
import { JwtAuthGuard } from "@app/common/guards/jwt.auth.guard";
import { InvalidRefreshTokenException } from "@app/common/exceptions/auth/invalid.refresh.token.exception";
import { LogoutResponse } from "@app/dtos/auth/logout.response";
import { TokenDto } from "@app/dtos/auth/token.dto";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { LoginDto } from "@app/dtos/auth/login.dto";
import { EmailDto } from "@app/dtos/auth/email.dto";
import { EmailService } from "@app/services/email.service";
import { UserAlreadyConfirmedException } from "@app/common/exceptions/auth/user.already.confirmed.exception";
import { User } from "@app/entities/user.entity";
import { UpdateCredentialsDto } from "@app/dtos/auth/update.creadentials.dto";
import { ResetPasswordDto } from "@app/dtos/auth/password.reset.dto";
import { InvalidVerificationCodeException } from "@app/common/exceptions/auth/invalid.verification.code.exception ";
import { EmailVerifiedGuard } from "@app/common/guards/email.verified.guard";
import { EmailExistGuard } from "@app/common/guards/email.exist.guard";
import { TokenService } from "@app/services/token.service";
import { GeneratorSevice } from "@app/services/generator.service";
import {
  ACCOUTN_CONFIRMATION,
  RESEND_CONFIRMATION_RESPONSE,
  VVERIFICTION_CODE_RESPONSE,
  RESET_PASSWORD_VERIFICATION_CODE,
} from "@app/common/constans/constans";
import { EntityNotFound } from "@app/common/exceptions/entity.not.found.exception";
import { AddUserToRequest } from "@app/common/interceptors/add.user.to.request.interceptor";
import { Request, Response } from "express";
import { LoginResponseCookies } from "@app/dtos/auth/login.response.cookies";

@ApiTags("auth")
@UseFilters(HttpExceptionFilter)
@Controller("auth")
export class AuthController {
  private readonly logger: Logger = new Logger(AuthController.name);
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

  @ApiOperation({ summary: "Account confirmation." })
  @ApiOkResponse({ description: "Success.", type: MessageInfo })
  @ApiNotFoundResponse({ description: "User not found." })
  @ApiBadRequestResponse({ description: "Confirmation token bad request." })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @Get("confirmation/:confirmationToken")
  async userConfirmation(@Param("confirmationToken") confirmationToken: string): Promise<MessageInfo> {
    try {
      const email: string = await this.tokenService.decodeConfirmationToken(confirmationToken);
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

  @ApiOperation({ summary: "User registration." })
  @ApiCreatedResponse({ description: "Success.", type: MessageInfo })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
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

  @ApiOperation({ summary: "User login." })
  @ApiCreatedResponse({ description: "Success.", type: LoginResponse })
  @ApiUnauthorizedResponse({ description: "User unauthorized." })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @UseGuards(EmailVerifiedGuard)
  @UsePipes(ValidationPipe)
  @Post("login")
  async login(@Body() user: LoginDto): Promise<LoginResponse> {
    try {
      const authorizedUser: User = await this.authService.comparePassword(user);
      const refreshToken: string = this.generatorService.generateRefreshToken();
      await this.tokenService.saveRefreshTokenToDB(authorizedUser, refreshToken);
      const accessToken: string = this.generatorService.generateAccessToken(authorizedUser);
      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof UserAuthenticateException) {
        throw new UnauthorizedException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "User login-cookies." })
  @ApiCreatedResponse({ description: "Success.", type: LoginResponseCookies })
  @ApiUnauthorizedResponse({ description: "User unauthorized." })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @UseGuards(EmailVerifiedGuard)
  @UsePipes(ValidationPipe)
  @Post("login-cookies")
  async loginCookies(@Body() user: LoginDto, @Res() response: Response): Promise<LoginResponseCookies> {
    try {
      const authorizedUser: User = await this.authService.comparePassword(user);
      const refreshToken: string = this.generatorService.generateRefreshToken();
      await this.tokenService.saveRefreshTokenToDB(authorizedUser, refreshToken);
      const accessToken: string = this.generatorService.generateAccessToken(authorizedUser);
      response.cookie("refreshToken", refreshToken, {
        sameSite: "strict",
        httpOnly: true,
      });
      return { accessToken };
    } catch (error) {
      if (error instanceof UserAuthenticateException) {
        throw new UnauthorizedException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "User logout." })
  @ApiOkResponse({ description: "Success.", type: LogoutResponse })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AddUserToRequest)
  @Patch("logout")
  async logout(@UserId() userId: string, @Body() payload: TokenDto): Promise<LogoutResponse> {
    try {
      return await this.authService.logout(userId, payload.refreshToken);
    } catch (error) {
      if (error instanceof InvalidRefreshTokenException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "User logout-cookies." })
  @ApiOkResponse({ description: "Success.", type: LogoutResponse })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AddUserToRequest)
  @Patch("logout-cookies")
  async logoutCookie(@UserId() userId: string, @Req() request: Request): Promise<LogoutResponse> {
    try {
      const refreshToken: string = request.cookies["cookieKey"];
      return await this.authService.logout(userId, refreshToken);
    } catch (error) {
      if (error instanceof InvalidRefreshTokenException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "Get new access and refresh tokens." })
  @ApiOkResponse({ description: "Success.", type: LoginResponse })
  @ApiBadRequestResponse({ description: "Refresh token bad request." })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @UsePipes(ValidationPipe)
  @Patch("tokens")
  async getNewTokens(@Body() payload: TokenDto): Promise<LoginResponse> {
    try {
      const authorizedUser: User = await this.tokenService.findUserByRefreshToken(payload.refreshToken);
      const refreshToken: string = this.generatorService.generateRefreshToken();
      await this.tokenService.saveRefreshTokenToDB(authorizedUser, refreshToken);
      const accessToken: string = this.generatorService.generateAccessToken(authorizedUser);
      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof EntityNotFound) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  @ApiOperation({ summary: "Get new access and refresh tokens-cookies." })
  @ApiOkResponse({ description: "Success." })
  @ApiBadRequestResponse({ description: "Refresh token bad request." })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @UsePipes(ValidationPipe)
  @Patch("tokens-cookie")
  async getNewTokensCookies(@Req() request: Request, @Res() response: Response): Promise<LoginResponseCookies> {
    try {
      const refreshTokenCookies: string = request.cookies["cookieKey"];
      const authorizedUser: User = await this.tokenService.findUserByRefreshToken(refreshTokenCookies);
      const refreshToken: string = this.generatorService.generateRefreshToken();
      await this.tokenService.saveRefreshTokenToDB(authorizedUser, refreshToken);
      const accessToken: string = this.generatorService.generateAccessToken(authorizedUser);
      response.cookie("refreshToken", refreshToken, {
        sameSite: "strict",
        httpOnly: true,
      });
      return { accessToken };
    } catch (error) {
      if (error instanceof EntityNotFound) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  @ApiOperation({ summary: "Update credentials." })
  @ApiOkResponse({ description: "Success.", type: User })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
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

  @ApiOperation({ summary: "Reset password." })
  @ApiOkResponse({ description: "Success.", type: MessageInfo })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
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

  @ApiOperation({ summary: "Reset password confirmation." })
  @ApiOkResponse({ description: "Success." })
  @ApiBadRequestResponse({ description: "Invalid verification code." })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
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
