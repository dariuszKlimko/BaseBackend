import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthService } from "@app/services/auth.service";
import { UserId } from "@app/common/decorators/user.id.decorator";
import { HttpExceptionFilter } from "@app/common/filters/http.exception.filter";
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
import { ResetPasswordDto } from "@app/dtos/auth/password.reset.dto";
import { InvalidVerificationCodeException } from "@app/common/exceptions/auth/invalid.verification.code.exception";
import { EmailVerifiedGuard } from "@app/common/guards/email.verified.guard";
import { EmailExistGuard } from "@app/common/guards/email.exist.guard";
import { TokenService } from "@app/services/token.service";
import { GeneratorSevice } from "@app/services/generator.service";
import {
  ACCOUTN_CONFIRMATION,
  RESEND_CONFIRMATION_RESPONSE,
  VVERIFICTION_CODE_RESPONSE,
  RESET_PASSWORD_VERIFICATION_CODE,
  EXTERNAL_PROVIDER,
} from "@app/common/constans/constans";
import { EntityNotFound } from "@app/common/exceptions/entity.not.found.exception";
import { AddUserToRequest } from "@app/common/interceptors/add.user.to.request.interceptor";
import { Request, Response } from "express";
import { LoginResponseCookies } from "@app/dtos/auth/login.response.cookies";
import { RolesGuard } from "@app/common/guards/roles.guard";
import { Roles } from "@app/common/decorators/roles.decorator";
import { Role } from "@app/common/types/enum/role.enum";
import { AuthServiceIntrface } from "@app/common/types/interfaces/services/auth.service.interface";
import { EmailServiceIntrface } from "@app/common/types/interfaces/services/email.service.interface";
import { TokenServiceIntrface } from "@app/common/types/interfaces/services/token.service.interface";
import { GeneratorServiceIntrface } from "@app/common/types/interfaces/services/generator.service.interface";
import { UserServiceIntrface } from "@app/common/types/interfaces/services/user.service.interface";
import { UserService } from "@app/services/user.service";
import { ThrottlerGuard } from "@nestjs/throttler";
import { CurrentUser } from "@app/common/decorators/user.decorator";
import { MailerRecipientsException } from "@app/common/exceptions/mailer.recipients.exception";
import { ChangePasswordDto } from "@app/dtos/auth/change.password.dto";
import { NotExternalProviderGuard } from "@app/common/guards/not.external.provider.guard";
import { LocalGuard } from "@app/common/guards/local.guard";
import { OAuthCodeDto } from "@app/dtos/auth/oauth.code.dto";
import { GoogleOAuthService } from "@app/services/google.oauth.service";
import { GoogleOAuthIntrface } from "@app/common/types/interfaces/services/google.oauth.service.interface";
import { TokenResponsePayload } from "@app/common/types/type/tokenResponsePayload";
import { AxiosResponse } from "axios";
import { OauthNotVerifiedUserException } from "@app/common/exceptions/auth/oauth.not.verified.user.exception";
import { UserDuplicatedException } from "@app/common/exceptions/user.duplicated.exception";
import { ExternalProvider } from "@app/common/types/enum/external.provider.enum";

@ApiTags("auth")
@UseFilters(HttpExceptionFilter)
@UseGuards(ThrottlerGuard)
@Controller("auth")
export class AuthController {
  private readonly logger: Logger = new Logger(AuthController.name);
  private readonly authService: AuthServiceIntrface;
  private readonly userService: UserServiceIntrface;
  private readonly emailService: EmailServiceIntrface;
  private readonly tokenService: TokenServiceIntrface;
  private readonly generatorService: GeneratorServiceIntrface;
  private readonly googleOAuthService: GoogleOAuthIntrface;

  constructor(
    authService: AuthService,
    userService: UserService,
    emailService: EmailService,
    tokenService: TokenService,
    generatorService: GeneratorSevice,
    googleOAuthService: GoogleOAuthService,
  ) {
    this.authService = authService;
    this.userService = userService;
    this.emailService = emailService;
    this.tokenService = tokenService;
    this.generatorService = generatorService;
    this.googleOAuthService = googleOAuthService;
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
  @UseGuards(EmailExistGuard, NotExternalProviderGuard)
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
      if (error instanceof MailerRecipientsException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "User login." })
  @ApiCreatedResponse({ description: "Success.", type: LoginResponse })
  @ApiUnauthorizedResponse({ description: "User unauthorized." })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @UseGuards(EmailVerifiedGuard, NotExternalProviderGuard, LocalGuard)
  @Post("login")
  async login(@Body() user: LoginDto): Promise<LoginResponse> {
    try {
      const authorizedUser: User = await this.userService.findOneByConditionOrThrow({ email: user.email });
      const refreshToken: string = this.generatorService.generateRefreshToken();
      await this.tokenService.saveRefreshTokenToUser(authorizedUser, refreshToken);
      const accessToken: string = this.generatorService.generateAccessToken(authorizedUser);
      return { accessToken, refreshToken };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "User login-cookies." })
  @ApiCreatedResponse({ description: "Success.", type: LoginResponseCookies })
  @ApiUnauthorizedResponse({ description: "User unauthorized." })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @UseGuards(EmailVerifiedGuard, NotExternalProviderGuard, LocalGuard)
  @Post("loginc")
  async loginCookies(@Body() user: LoginDto, @Res() response: Response): Promise<Response<LoginResponseCookies>> {
    try {
      const authorizedUser: User = await this.userService.findOneByConditionOrThrow({ email: user.email });
      const refreshToken: string = this.generatorService.generateRefreshToken();
      await this.tokenService.saveRefreshTokenToUser(authorizedUser, refreshToken);
      const accessToken: string = this.generatorService.generateAccessToken(authorizedUser);
      response.cookie("refreshToken", refreshToken, {
        sameSite: "strict",
        httpOnly: true,
      });
      return response.send({ accessToken });
    } catch (error) {
      if (error instanceof UserAuthenticateException) {
        throw new UnauthorizedException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "User logout." })
  @ApiOkResponse({ description: "Success.", type: LogoutResponse })
  @ApiBadRequestResponse({ description: "Refresh token bad request." })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AddUserToRequest)
  @Patch("logout")
  async logout(@CurrentUser() user: User, @Body() payload: TokenDto): Promise<LogoutResponse> {
    try {
      await this.tokenService.deleteRefreshTokenFromUser(user, payload.refreshToken);
      return { email: user.email };
    } catch (error) {
      if (error instanceof InvalidRefreshTokenException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "User logout-cookies." })
  @ApiOkResponse({ description: "Success.", type: LogoutResponse })
  @ApiBadRequestResponse({ description: "Refresh token bad request." })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AddUserToRequest)
  @Patch("logoutc")
  async logoutCookie(
    @CurrentUser() user: User,
    @Req() request: Request,
    @Res() response: Response
  ): Promise<Response<LogoutResponse>> {
    try {
      const refreshToken: string = request.cookies["refreshToken"];
      await this.tokenService.deleteRefreshTokenFromUser(user, refreshToken);
      return response.send({ email: user.email });
    } catch (error) {
      if (error instanceof InvalidRefreshTokenException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "User force logout." })
  @ApiOkResponse({ description: "Success.", type: LogoutResponse })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AddUserToRequest)
  @Patch("forcelogout")
  async forceLogout(@UserId() userId: string): Promise<LogoutResponse> {
    try {
      return await this.tokenService.deleteAllRefreshTokensFromUser(userId);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "Get new access and refresh tokens." })
  @ApiOkResponse({ description: "Success.", type: LoginResponse })
  @ApiBadRequestResponse({ description: "Refresh token bad request." })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @Patch("tokens")
  async getNewTokens(@Body() payload: TokenDto): Promise<LoginResponse> {
    try {
      const authorizedUser: User = await this.tokenService.findUserByRefreshToken(payload.refreshToken);
      await this.tokenService.deleteRefreshTokenFromUser(authorizedUser, payload.refreshToken);
      const refreshToken: string = this.generatorService.generateRefreshToken();
      await this.tokenService.saveRefreshTokenToUser(authorizedUser, refreshToken);
      const accessToken: string = this.generatorService.generateAccessToken(authorizedUser);
      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof EntityNotFound) {
        throw new NotFoundException(error.message);
      } else if (error instanceof InvalidRefreshTokenException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  @ApiOperation({ summary: "Get new access and refresh tokens-cookies." })
  @ApiOkResponse({ description: "Success." })
  @ApiBadRequestResponse({ description: "Refresh token bad request." })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @Patch("tokensc")
  async getNewTokensCookies(
    @Req() request: Request,
    @Res() response: Response
  ): Promise<Response<LoginResponseCookies>> {
    try {
      const refreshTokenCookies: string = request.cookies["refreshToken"];
      const authorizedUser: User = await this.tokenService.findUserByRefreshToken(refreshTokenCookies);
      await this.tokenService.deleteRefreshTokenFromUser(authorizedUser, refreshTokenCookies);
      const refreshToken: string = this.generatorService.generateRefreshToken();
      await this.tokenService.saveRefreshTokenToUser(authorizedUser, refreshToken);
      const accessToken: string = this.generatorService.generateAccessToken(authorizedUser);
      response.cookie("refreshToken", refreshToken, {
        sameSite: "strict",
        httpOnly: true,
      });
      return response.send({ accessToken });
    } catch (error) {
      if (error instanceof EntityNotFound) {
        throw new NotFoundException(error.message);
      } else if (error instanceof InvalidRefreshTokenException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  @ApiOperation({ summary: "Update credentials." })
  @ApiOkResponse({ description: "Success.", type: User })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, NotExternalProviderGuard)
  @UseInterceptors(AddUserToRequest)
  @Patch("password")
  async updateCredentials(@UserId() userId: string, @Body() userInfo: ChangePasswordDto): Promise<User> {
    try {
      await this.authService.comparePassword({ email: userInfo.email, password: userInfo.password });
      return await this.authService.updatePassword(userId, {
        email: userInfo.email,
        password: userInfo.newPassword,
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "Reset password." })
  @ApiOkResponse({ description: "Success.", type: MessageInfo })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @UseGuards(EmailVerifiedGuard, NotExternalProviderGuard)
  @Patch("reset-password")
  async resetPassword(@Body() userInfo: EmailDto): Promise<MessageInfo> {
    try {
      const user: User = await this.userService.findOneByConditionOrThrow({ email: userInfo.email });
      const code: number = this.generatorService.codeGenerator(100000, 999999);
      await this.userService.updateVerificationCode(user.id, { verificationCode: code });
      const text: string = this.generatorService.resetPasswordEmailText(userInfo.email, code);
      const subject: string = RESET_PASSWORD_VERIFICATION_CODE;
      await this.emailService.sendEmail(userInfo.email, text, subject);
      return VVERIFICTION_CODE_RESPONSE;
    } catch (error) {
      if (error instanceof EntityNotFound) {
        throw new NotFoundException(error.message);
      } else if (error instanceof MailerRecipientsException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "Reset password confirmation." })
  @ApiOkResponse({ description: "Success.", type: MessageInfo })
  @ApiBadRequestResponse({ description: "Invalid verification code." })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @UseGuards(EmailVerifiedGuard, NotExternalProviderGuard)
  @Patch("reset-password-confirm")
  async resetPasswordConfirm(@Body() resetPassword: ResetPasswordDto): Promise<MessageInfo> {
    try {
      return await this.authService.resetPasswordConfirm(resetPassword);
    } catch (error) {
      if (error instanceof InvalidVerificationCodeException) {
        throw new BadRequestException(error.message);
      } else if (error instanceof EntityNotFound) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "User force logout." })
  @ApiOkResponse({ description: "Success.", type: LogoutResponse })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin_0)
  @Patch("forcelogoutbyadmin/:userid")
  async forceLogoutbyadmin(@Param("userid", ParseUUIDPipe) userId: string): Promise<LogoutResponse> {
    try {
      return await this.tokenService.deleteAllRefreshTokensFromUser(userId);
    } catch (error) {
      if (error instanceof EntityNotFound) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }
  // ----------------------------------------
  @ApiOperation({ summary: "User login." })
  @ApiCreatedResponse({ description: "Success.", type: LoginResponse })
  @ApiUnauthorizedResponse({ description: "User unauthorized." })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @Post("googleoauth")
  async googleoauth(@Body() oauth: OAuthCodeDto): Promise<LoginResponse> {
    try {
      const token: AxiosResponse = await this.googleOAuthService.exchangeCodeForToken(oauth.code)
      const userInfo: AxiosResponse = await this.googleOAuthService.exchangeTokenForUserInfo(token.data.access_token)
      const userAuth = {
        email: userInfo.data.email,
        verified: userInfo.data.email_verified,
        provider: ExternalProvider.GOOGLE,
      }
      console.log("DK____userAuth: ",userAuth)
      const authorizedUser: User = await this.authService.googleOauth(userAuth);
      const refreshToken: string = this.generatorService.generateRefreshToken();
      await this.tokenService.saveRefreshTokenToUser(authorizedUser, refreshToken);
      const accessToken: string = this.generatorService.generateAccessToken(authorizedUser);
      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof OauthNotVerifiedUserException) {
        throw new BadRequestException(error.message);
      } else if (error instanceof UserDuplicatedException) {
        throw new ConflictException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }
}


// https://accounts.google.com/o/oauth2/v2/auth?scope=https%3A//www.googleapis.com/auth/drive.metadata.readonly&include_granted_scopes=true&response_type=code&state=state_parameter_passthrough_value&redirect_uri=http%3A//localhost:80&client_id=549374378041-4i7cj3e8h78dr8qsfj8ga0gkldhk80f9.apps.googleusercontent.com

// https://accounts.google.com/o/oauth2/v2/auth?response_type=code&scope=openid+email&redirect_uri=http%3A//localhost:80&client_id=549374378041-4i7cj3e8h78dr8qsfj8ga0gkldhk80f9.apps.googleusercontent.com
