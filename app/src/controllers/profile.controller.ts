import { UserId } from "@app/common/decorators/userId.decorator";
import { HttpExceptionFilter } from "@app/common/filter/HttpException.filter";
import { JwtAuthGuard } from "@app/common/guards/jwt-auth.guard";
import { CurrentUserDecorator } from "@app/common/types/currentUserDecorator";
import { UpdateProfileDto } from "@app/dtos/profile/update-profile.dto";
import { Profile } from "@app/entities/profile.entity";
import { ProfilesService } from "@app/services/profile.service";
import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Patch,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("profiles")
@UseFilters(HttpExceptionFilter)
@Controller("profiles")
export class ProfilessController {
  private readonly profilesService: ProfilesService;

  constructor(profilesService: ProfilesService) {
    this.profilesService = profilesService;
  }

  @ApiOperation({ summary: "get profile" })
  @ApiResponse({
    status: 200,
    type: Profile,
    description: "profile been successfully loaded",
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async getProfile(@UserId() userId: string): Promise<Profile> {
    try {
      return await this.profilesService.getProfile(userId);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "update profile" })
  @ApiResponse({
    status: 200,
    type: Profile,
    description: "profile has been successfully updated",
  })
  @ApiBearerAuth()
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  @Patch()
  async updateProfile(
    @UserId() userId: string,
    @Body() profile: UpdateProfileDto
  ): Promise<Profile> {
    try {
      return await this.profilesService.updateProfile(userId, profile);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
