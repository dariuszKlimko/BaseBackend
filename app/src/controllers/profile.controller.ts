import { Roles } from "@app/common/decorators/roles.decorator";
import { UserId } from "@app/common/decorators/user.id.decorator";
import { HttpExceptionFilter } from "@app/common/filter/http.exception.filter";
import { JwtAuthGuard } from "@app/common/guards/jwt.auth.guard";
import { RolesGuard } from "@app/common/guards/roles.guard";
import { AddUserToRequest } from "@app/common/interceptors/add.user.to.request.interceptor";
import { Role } from "@app/common/types/role.enum";
import { UpdateProfileDto } from "@app/dtos/profile/update.profile.dto";
import { Profile } from "@app/entities/profile.entity";
import { ProfileServiceIntrface } from "@app/services/interfaces/profile.service.interface";
import { ProfileService } from "@app/services/profile.service";
import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  ParseIntPipe,
  Patch,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { In } from "typeorm";

@ApiTags("profiles")
@UseFilters(HttpExceptionFilter)
@Controller("profiles")
export class ProfileController {
  private readonly logger: Logger = new Logger(ProfileController.name);
  private readonly profileService: ProfileServiceIntrface;

  constructor(profileService: ProfileService) {
    this.profileService = profileService;
  }

  @ApiOperation({ summary: "Get profile." })
  @ApiOkResponse({ description: "Success.", type: Profile })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AddUserToRequest)
  @Get()
  async getProfile(@UserId() userId: string): Promise<Profile> {
    try {
      return await this.profileService.findOneByConditionOrThrow({ userId });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "Update profile." })
  @ApiOkResponse({ description: "Success.", type: Profile })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AddUserToRequest)
  @Patch()
  async updateProfile(@UserId() userId: string, @Body() profile: UpdateProfileDto): Promise<Profile> {
    try {
      const profileDb: Profile = await this.profileService.findOneByConditionOrThrow({ userId });
      await this.profileService.updateOne(profileDb.id, profile);
      return await this.profileService.findOneByIdOrThrow(profileDb.id);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
  // -------------------------------------------------------
  @ApiOperation({ summary: "Get profiles - admin." })
  @ApiOkResponse({ description: "Success.", type: [Profile] })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin_0)
  @Get("getallprofiles")
  async getProfilesByAdmin(
    @Query("skip", ParseIntPipe) skip: number,
    @Query("take", ParseIntPipe) take: number
  ): Promise<[Profile[], number]> {
    try {
      return await this.profileService.findAll(skip, take);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "Get profiles data by ids - admin." })
  @ApiOkResponse({ description: "Success.", type: [Profile] })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin_0)
  @Get("getprofilesbyids")
  async getProfilesByIdsByAdmin(@Body() ids: string[]): Promise<[Profile[], number]> {
    try {
      return await this.profileService.findAllByIds(ids);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "Get profiles data by userIds - admin." })
  @ApiOkResponse({ description: "Success.", type: [Profile] })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin_0)
  @Get("getprofilesbyuserids")
  async getProfilesByUserIdsByAdmin(@Body() userIds: string[]): Promise<[Profile[], number]> {
    try {
      return await this.profileService.findAllByCondition({ userId: In(userIds) });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
