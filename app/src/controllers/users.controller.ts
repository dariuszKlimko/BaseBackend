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
} from "@nestjs/common";
import { UsersService } from "@app/services/user.service";
import { CreateUserDto } from "@app/dtos/user/create-user.dto";
import { HttpExceptionFilter } from "@app/common/filter/HttpException.filter";
import { CurrentUser } from "@app/common/decorators/currentUser.decorator";
import { UserDuplicatedException } from "@app/common/exceptions/user/userDuplicated.exception";
import { EmailService } from "@app/services/email.service";
import { User } from "@app/entities/user.entity";
import { JwtAuthGuard } from "@app/common/guards/jwt-auth.guard";
import { CurrentUserDecorator } from "@app/common/types/currentUserDecorator";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GeneratorSevice } from "@app/services/generator.service";
import { ACCOUTN_CONFIRMATION } from "@app/common/constans/constans";

@ApiTags("users")
@UseFilters(HttpExceptionFilter)
@Controller("users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
    private readonly generatorService: GeneratorSevice,
  ) {}

  @ApiOperation({ summary: "user registration" })
  @ApiResponse({ status: 201, type: User, description: "user has been successfully created" })
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

  @ApiOperation({ summary: "get user data" })
  @ApiResponse({ status: 200, type: User, description: "user's info has been successfully loaded" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async getUser(@CurrentUser() user: CurrentUserDecorator): Promise<User> {
    try {
      return await this.usersService.getUser(user.id);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "delete user account with measurement" })
  @ApiResponse({ status: 200, type: User, description: "user has been successfully deleted" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteUser(@CurrentUser() user: CurrentUserDecorator): Promise<User> {
    try {
      return await this.usersService.deleteUser(user.id);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
