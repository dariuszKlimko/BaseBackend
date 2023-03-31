import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  UseFilters,
  UseGuards,
  InternalServerErrorException,
  ConflictException,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { UsersService } from "@app/modules/user/user.service";
import { CreateUserDto } from "@app/modules/user/dto/create-user.dto";
import { UpdateUserDto } from "@app/modules/user/dto/update-user.dto";
import { HttpExceptionFilter } from "@app/common/filter/HttpException.filter";
import { CurrentUser } from "@app/common/decorators/currentUser.decorator";
import { UserDuplicateException } from "@app/modules/user/exceptions/userDuplicate.exception";
import { EmailService } from "@app/modules/email/email.service";
import { User } from "@app/modules/user/entities/user.entity";
import { JwtAuthGuard } from "@app/common/guards/jwt-auth.guard";
import { CurrentUserDecorator } from "@app/common/types/currentUserDecorator";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("users")
@UseFilters(HttpExceptionFilter)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly emailService: EmailService) {}

  @ApiOperation({ summary: "user registration" })
  @ApiResponse({ status: 201, type: User, description: "user has been successfully created" })
  @UsePipes(ValidationPipe)
  @Post()
  async registerUser(@Body() user: CreateUserDto): Promise<User> {
    try {
      const userPayload: User = await this.usersService.registerUser(user);
      await this.emailService.sendEmail(user.email);
      return userPayload;
    } catch (error) {
      if (error instanceof UserDuplicateException) {
        throw new ConflictException(error.message);
      }
      throw new InternalServerErrorException();
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

  @ApiOperation({ summary: "update user" })
  @ApiResponse({ status: 200, type: User, description: "user has been successfully updated" })
  @ApiBearerAuth()
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  @Patch()
  async updateUser(@CurrentUser() user: CurrentUserDecorator, @Body() userInfo: UpdateUserDto): Promise<User> {
    try {
      return await this.usersService.updateUser(user.id, userInfo);
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
