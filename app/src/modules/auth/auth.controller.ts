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
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { AuthService } from "@app/modules/auth/auth.service";
import { CurrentUser } from "@app/common/decorators/currentUser.decorator";
import { HttpExceptionFilter } from "@app/common/filter/HttpException.filter";
import { CreateUserDto } from "@app/modules/user/dto/create-user.dto";
import { LoginResponseDto } from "@app/modules/auth/dto/login-response.dto";
import { UserNotFoundException } from "@app/common/types/userNotFound.exception";
import { UserAuthenticateException } from "@app/modules/auth/exceptions/userAuthenticate.exception";
import { UserNotVerifiedException } from "@app/modules/auth/exceptions/userNotVerified.exception";
import { IncorrectVerificationCode } from "@app/modules/auth/exceptions/incorrectVerificationCode.exception";
import { MessageInfo } from "@app/common/dto/messageInfo";
import { JwtAuthGuard } from "@app/common/guards/jwt-auth.guard";
import { InvalidRefreshTokenException } from "@app/modules/auth/exceptions/invalidRefreshToken.exception";
import { CurrentUserDecorator } from "@app/common/types/currentUserDecorator";
import { LogoutResponseDto } from "@app/modules/auth/dto/logout-response.dto";
import { TokenDto } from "@app/modules/auth/dto/token.dto";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("auth")
@UseFilters(HttpExceptionFilter)
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: "account confirmation" })
  @ApiResponse({ status: 200, type: MessageInfo, description: "user has been successfully verified" })
  @ApiResponse({ status: 400, description: "incorrect verification code" })
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

  @ApiOperation({ summary: "user login" })
  @ApiResponse({ status: 201, type: LoginResponseDto, description: "user has been successfully logged in" })
  @ApiResponse({ status: 400, description: "user not verified / data validation " })
  @ApiResponse({ status: 401, description: "user unauthorized " })
  @ApiResponse({ status: 404, description: "user not found" })
  @UsePipes(ValidationPipe)
  @Post()
  async login(@Body() user: CreateUserDto): Promise<LoginResponseDto> {
    try {
      return await this.authService.login(user);
    } catch (error) {
      console.log(error.message);
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

  @ApiOperation({ summary: "user logout" })
  @ApiResponse({ status: 200, type: LogoutResponseDto, description: "user has been successfully logged out" })
  @ApiResponse({ status: 400, description: "invalid refresh token / data validation" })
  @ApiResponse({ status: 401, description: "unauthorized" })
  @ApiBearerAuth()
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  @Patch()
  async logout(@CurrentUser() user: CurrentUserDecorator, @Body() token: TokenDto): Promise<LogoutResponseDto> {
    try {
      return await this.authService.logout(user.id, token.refreshToken);
    } catch (error) {
      if (error instanceof InvalidRefreshTokenException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "get new access and refresh tokens" })
  @ApiResponse({ status: 200, type: LoginResponseDto, description: "tokens has been successfully refreshed" })
  @ApiResponse({ status: 400, description: "invalid refresh token / data validation" })
  @UsePipes(ValidationPipe)
  @Patch("/tokens")
  async getNewTokens(@Body() token: TokenDto): Promise<LoginResponseDto> {
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
