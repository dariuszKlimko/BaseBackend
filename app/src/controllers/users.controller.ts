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
  Patch,
  NotFoundException,
  ParseIntPipe,
  Query,
  SerializeOptions,
  ParseUUIDPipe,
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
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { GeneratorSevice } from "@app/services/generator.service";
import { ACCOUTN_CONFIRMATION } from "@app/common/constans/constans";
import { AddUserToRequest } from "@app/common/interceptors/add.user.to.request.interceptor";
import { UpdateUserDto } from "@app/dtos/user/update.user.dto";
import { EntityNotFound } from "@app/common/exceptions/entity.not.found.exception";
import { Roles } from "@app/common/decorators/roles.decorator";
import { Role } from "@app/common/types/role.enum";
import { CreateUserByAdminDto } from "@app/dtos/user/create.user.by.admin.dto";
import { RolesGuard } from "@app/common/guards/roles.guard";
import { UpdateUserByAdminDto } from "@app/dtos/user/update.user.by.admin.dto";

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
      if (error instanceof EntityNotFound) {
        throw new NotFoundException(error.message);
      }
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
  // ----------------------------------------------------
  @ApiOperation({ summary: "Update User." })
  @ApiOkResponse({ description: "Success.", type: User })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AddUserToRequest)
  @Patch()
  async updateUser(@UserId() userId: string, @Body() userInfo: UpdateUserDto): Promise<User> {
    try {
      const user: User = await this.usersService.getUser(userId);
      this.usersService.mergeUserEntity(user, userInfo);
      return await this.usersService.saveUser(user);
    } catch (error) {
      if (error instanceof EntityNotFound) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "Get all users data - admin." })
  @ApiOkResponse({ description: "Success.", type: [User] })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SerializeOptions({ groups: [Role.Admin_0] })
  @Roles(Role.Admin_0)
  @Get("getallusers")
  async getAllUsersByAdmin(
    @Query("skip", ParseIntPipe) skip: number,
    @Query("take", ParseIntPipe) take: number
  ): Promise<[User[], number]> {
    try {
      return await this.usersService.getAllUsersByAdmin(skip, take);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "Get user data by ids - admin." })
  @ApiOkResponse({ description: "Success.", type: [User] })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SerializeOptions({ groups: [Role.Admin_0] })
  @Roles(Role.Admin_0)
  @Get("getusersbyids")
  async getUsersByIdsByAdmin(@Body() ids: string[]): Promise<[User[], number]> {
    try {
      return await this.usersService.getUsersByIdsByAdmin(ids);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "Get user data by email - admin." })
  @ApiOkResponse({ description: "Success.", type: User })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SerializeOptions({ groups: [Role.Admin_0] })
  @Roles(Role.Admin_0)
  @Get("getusersbyemails")
  async getUsersByEmailsByAdmin(@Body() emails: string[]): Promise<[User[], number]> {
    try {
      return await this.usersService.getUsersByEmailsByAdmin(emails);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "Get user data by id with relations - admin." })
  @ApiOkResponse({ description: "Success.", type: User })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SerializeOptions({ groups: [Role.Admin_0] })
  @Roles(Role.Admin_0)
  @Get("getuserwithrelation")
  async getUserWithRelationByAdmin(@Query("id", ParseUUIDPipe) id: string): Promise<User> {
    try {
      return await this.usersService.getUserWithRelationByAdmin(id);
    } catch (error) {
      if (error instanceof EntityNotFound) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "Delete users by ids - admin." })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SerializeOptions({ groups: [Role.Admin_0] })
  @Roles(Role.Admin_0)
  @Delete("deletebyids")
  async deleteUsersByIdsByAdmi(@Body() ids: string[]): Promise<User[]> {
    try {
      return await this.usersService.deleteUsersByIdsByAdmin(ids);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "User registration by admin." })
  @ApiCreatedResponse({ description: "Success.", type: User })
  @ApiConflictResponse({ description: "User exist in database." })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SerializeOptions({ groups: [Role.Admin_0] })
  @Roles(Role.Admin_0)
  @Post("createuserbyadmin")
  async createUserByAdmin(@Body() user: CreateUserByAdminDto): Promise<User> {
    try {
      const userPayload: User = await this.usersService.registerUser(user);
      return userPayload;
    } catch (error) {
      if (error instanceof UserDuplicatedException) {
        throw new ConflictException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  @ApiOperation({ summary: "Update user role." })
  @ApiOkResponse({ description: "Success.", type: User })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SerializeOptions({ groups: [Role.Admin_0] })
  @Roles(Role.Admin_0)
  @Patch("updateuserrole")
  async updateUserRoleByAdmin(
    @Query("id", ParseUUIDPipe) id: string,
    @Body() userInfo: UpdateUserByAdminDto
  ): Promise<User> {
    try {
      return await this.usersService.updateUserRoleByAdmin(id, userInfo.role);
    } catch (error) {
      if (error instanceof EntityNotFound) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }
}
