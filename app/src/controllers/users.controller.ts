import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseFilters,
  UseGuards,
  InternalServerErrorException,
  ConflictException,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  Logger,
} from "@nestjs/common";
import { UsersService } from "@app/services/user.service";
import { CreateUserDto } from "@app/dtos/user/create.user.dto";
import { HttpExceptionFilter } from "@app/common/filter/http.exception.filter";
import { UserId } from "@app/common/decorators/user.id.decorator";
import { UserDuplicatedException } from "@app/common/exceptions/user.duplicated.exception";
import { EmailService } from "@app/services/email.service";
import { User } from "@app/entities/user.entity";
import { JwtAuthGuard } from "@app/common/guards/jwt.auth.guard";
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { GeneratorSevice } from "@app/services/generator.service";
import { ACCOUTN_CONFIRMATION } from "@app/common/constans/constans";
import { AddUserToRequest } from "@app/common/interceptors/add.user.to.request.interceptor";

@ApiTags("users")
@UseFilters(HttpExceptionFilter)
@Controller("users")
export class UsersController {
  private readonly logger: Logger = new Logger(UsersController.name);
  private readonly usersService: UsersService;
  private readonly emailService: EmailService;
  private readonly generatorService: GeneratorSevice;

  constructor(usersService: UsersService, emailService: EmailService, generatorService: GeneratorSevice) {
    this.usersService = usersService;
    this.emailService = emailService;
    this.generatorService = generatorService;
  }

  @ApiOperation({ summary: "User registration." })
  @ApiCreatedResponse({ description: "Success.", type: User })
  @ApiConflictResponse({ description: "User exist in database." })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @UsePipes(ValidationPipe)
  @Post()
  async registerUser(@Body() user: CreateUserDto): Promise<User> {
    try {
      const userPayload: User = await this.usersService.registerUser(user);
      const confirmationLink: string = this.generatorService.confirmationLinkGenerate(userPayload.email);
      const text: string = this.generatorService.verificationEmailText(userPayload.email, confirmationLink);
      const subject: string = ACCOUTN_CONFIRMATION;
      await this.emailService.sendEmail(userPayload.email, text, subject);
      return userPayload;
    } catch (error) {
      if (error instanceof UserDuplicatedException) {
        throw new ConflictException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  @ApiOperation({ summary: "Get user data." })
  @ApiOkResponse({ description: "Success.", type: User })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AddUserToRequest)
  @Get()
  async getUser(@UserId() userId: string): Promise<User> {
    try {
      return await this.usersService.getUser(userId);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "Delete user account with measurement." })
  @ApiOkResponse({ description: "Success.", type: User })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AddUserToRequest)
  @Delete()
  async deleteUser(@UserId() userId: string): Promise<User> {
    try {
      return await this.usersService.deleteUser(userId);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
