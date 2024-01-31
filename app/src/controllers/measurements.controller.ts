import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { MeasurementService } from "@app/services/measurement.service";
import { HttpExceptionFilter } from "@app/common/filter/http.exception.filter";
import { JwtAuthGuard } from "@app/common/guards/jwt.auth.guard";
import { UserId } from "@app/common/decorators/user.id.decorator";
import { CreateMeasurementDto } from "@app/dtos/measurement/create.measurement.dto";
import { UpdateMeasurementDto } from "@app/dtos/measurement/update.measurement.dto";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { Measurement } from "@app/entities/measurement.entity";
import { EntityNotFound } from "@app/common/exceptions/entity.not.found.exception";
import { AddUserToRequest } from "@app/common/interceptors/add.user.to.request.interceptor";
import { RolesGuard } from "@app/common/guards/roles.guard";
import { Roles } from "@app/common/decorators/roles.decorator";
import { Role } from "@app/common/types/role.enum";
import { ProfileService } from "@app/services/profile.service";
import { Profile } from "@app/entities/profile.entity";
import { MathSevice } from "@app/services/math.service";
import { MeasurementServiceIntrface } from "@app/services/interfaces/measurement.service.interface";
import { ProfileServiceIntrface } from "@app/services/interfaces/profile.service.interface";
import { MathServiceIntrface } from "@app/services/interfaces/math.service.interface";

@ApiTags("measurements")
@UseFilters(HttpExceptionFilter)
@Controller("measurements")
export class MeasurementController {
  private readonly logger: Logger = new Logger(MeasurementController.name);
  private readonly measurementService: MeasurementServiceIntrface;
  private readonly profileService: ProfileServiceIntrface;
  private readonly mathService: MathServiceIntrface;

  constructor(measurementService: MeasurementService, profileService: ProfileService, mathService: MathSevice) {
    this.measurementService = measurementService;
    this.profileService = profileService;
    this.mathService = mathService;
  }

  @ApiOperation({ summary: "Create measuremet." })
  @ApiCreatedResponse({ description: "Success.", type: Measurement })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AddUserToRequest)
  @Post()
  async createMeasurement(
    @UserId() userId: string,
    @Body() measurementPayload: CreateMeasurementDto
  ): Promise<Measurement> {
    try {
      let bmi: number;
      const profile: Profile = await this.profileService.findOneByConditionOrThrow({ userId });
      const measurement: Measurement = await this.measurementService.createOne(measurementPayload);
      measurement.userId = userId;
      if (profile.height) {
        bmi = measurementPayload.weight / this.mathService.powValue(profile.height / 100, 2);
        measurement.bmi = this.mathService.roundValue(bmi, 2);
      }
      return await this.measurementService.saveOneByEntity(measurement);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "Get all measurement for given user." })
  @ApiOkResponse({ description: "Success.", type: [Measurement] })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AddUserToRequest)
  @Get()
  async getAllMeasurementsByUserId(@UserId() userId: string): Promise<[Measurement[], number]> {
    try {
      return await this.measurementService.findAllByCondition({ userId });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "Get measurement by id." })
  @ApiOkResponse({ description: "Success.", type: Measurement })
  @ApiNotFoundResponse({ description: "Measurement not found" })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AddUserToRequest)
  @Get(":id")
  async getOneMeasurement(@UserId() userId: string, @Param("id", ParseUUIDPipe) id: string): Promise<Measurement> {
    try {
      return await this.measurementService.findOneByConditionOrThrow({
        userId,
        id,
      });
    } catch (error) {
      if (error instanceof EntityNotFound) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "Update measurement by id." })
  @ApiOkResponse({ description: "Success.", type: Measurement })
  @ApiNotFoundResponse({ description: "Measurement not found" })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AddUserToRequest)
  @Patch(":id")
  async updateMeasurement(
    @UserId() userId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() measurementPayload: UpdateMeasurementDto
  ): Promise<Measurement> {
    try {
      const measurement: Measurement = await this.measurementService.findOneByConditionOrThrow({
        userId,
        id,
      });
      await this.measurementService.updateOne(measurement.id, measurementPayload);
      return this.measurementService.findOneByIdOrThrow(measurement.id);
    } catch (error) {
      if (error instanceof EntityNotFound) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "Delete all measurements for given user." })
  @ApiOkResponse({ description: "Success.", type: [Measurement] })
  @ApiNotFoundResponse({ description: "Measurements not found" })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AddUserToRequest)
  @Delete()
  async deleteAllMeasurementsByUserId(@UserId() userId: string): Promise<Measurement[]> {
    try {
      const [measurements]: [Measurement[], number] = await this.measurementService.findAllByCondition({
        userId,
      });
      return await this.measurementService.deleteManyByEntities(measurements);
    } catch (error) {
      if (error instanceof EntityNotFound) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "Delete measurement by id." })
  @ApiOkResponse({ description: "Success.", type: Measurement })
  @ApiNotFoundResponse({ description: "Measurement not found" })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AddUserToRequest)
  @Delete(":id")
  async deleteOneMeasurement(
    @UserId() userId: string,
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<Measurement> {
    try {
      const measurement: Measurement = await this.measurementService.findOneByConditionOrThrow({
        userId,
        id,
      });
      return await this.measurementService.deleteOneByEntity(measurement);
    } catch (error) {
      if (error instanceof EntityNotFound) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }
  // ----------------------------------------------------------------------------
  @ApiOperation({ summary: "Get all measurement." })
  @ApiOkResponse({ description: "Success.", type: [Measurement] })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin_0)
  @Get("getallmeasurements")
  async getAllMeasurementsByAdmin(
    @Query("skip", ParseIntPipe) skip: number,
    @Query("take", ParseIntPipe) take: number
  ): Promise<[Measurement[], number]> {
    try {
      return await this.measurementService.findAll(skip, take);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "Get all measurement by ids." })
  @ApiOkResponse({ description: "Success.", type: [Measurement] })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin_0)
  @Get("getallmeasurementsbyids")
  async getAllMeasurementsByIdsByAdmin(@Body() ids: string[]): Promise<[Measurement[], number]> {
    try {
      return await this.measurementService.findAllByIds(ids);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "Delete all measurements by ids." })
  @ApiOkResponse({ description: "Success.", type: [Measurement] })
  @ApiNotFoundResponse({ description: "Measurements not found" })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin_0)
  @Delete("daletemeasurementsbyids")
  async deleteAllMeasurementsByIdsByAdmin(@Body() ids: string[]): Promise<Measurement[]> {
    try {
      const [measurements]: [Measurement[], number] = await this.measurementService.findAllByIds(ids);
      return await this.measurementService.deleteManyByEntities(measurements);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "Delete all measurements by user id." })
  @ApiOkResponse({ description: "Success.", type: [Measurement] })
  @ApiNotFoundResponse({ description: "Measurements not found" })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin_0)
  @Delete("daletemeasurementsbyuserid")
  async deleteMeasurementsByUserIdByAdmi(@Query("userid", ParseUUIDPipe) userId: string): Promise<Measurement[]> {
    try {
      const [measurements]: [Measurement[], number] = await this.measurementService.findAllByCondition({
        userId,
      });
      return await this.measurementService.deleteManyByEntities(measurements);
    } catch (error) {
      if (error instanceof EntityNotFound) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "Update measurement by id." })
  @ApiOkResponse({ description: "Success.", type: [Measurement] })
  @ApiNotFoundResponse({ description: "Measurements not found" })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin_0)
  @Delete("updatemeasurementbyidbyadmin")
  async updateMeasurementByIdByAdmin(
    @Query("id", ParseUUIDPipe) id: string,
    @Body() measurementPayload: UpdateMeasurementDto
  ): Promise<Measurement> {
    try {
      const measurement: Measurement = await this.measurementService.findOneByIdOrThrow(id);
      await this.measurementService.updateOne(measurement.id, measurementPayload);
      return await this.measurementService.findOneByIdOrThrow(measurement.id);
    } catch (error) {
      if (error instanceof EntityNotFound) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }
}
