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

@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService, private emailService: EmailService) {}

  @UseFilters(HttpExceptionFilter)
  @Post()
  async registerUser(@Body() user: CreateUserDto): Promise<User> {
    try {
      const userPayload: User = await this.usersService.registerUser(user);
      await this.emailService.sendEmail(user.email, userPayload.verificationCode);
      userPayload.verificationCode = null;
      return userPayload;
    } catch (error) {
      if (error instanceof UserDuplicateException) {
        throw new ConflictException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @UseFilters(HttpExceptionFilter)
  @Get()
  async getUser(@CurrentUser() user: CurrentUserDecorator): Promise<User> {
    try {
      return await this.usersService.getUser(user.id);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @UseFilters(HttpExceptionFilter)
  @Patch()
  async updateUser(@CurrentUser() user: CurrentUserDecorator, @Body() userInfo: UpdateUserDto): Promise<User> {
    try {
      return await this.usersService.updateUser(user.id, userInfo);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @UseFilters(HttpExceptionFilter)
  @Delete()
  async deleteUser(@CurrentUser() user: CurrentUserDecorator): Promise<User> {
    try {
      return await this.usersService.deleteUser(user.id);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
