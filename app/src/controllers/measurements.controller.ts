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
import { MeasurementsService } from "@app/services/measurements.service";
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

@ApiTags("measurements")
@UseFilters(HttpExceptionFilter)
@Controller("measurements")
export class MeasurementsController {
  private readonly logger: Logger = new Logger(MeasurementsController.name);
  private readonly measurementsService: MeasurementsService;

  constructor(measurementsService: MeasurementsService) {
    this.measurementsService = measurementsService;
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
    @Body() measurement: CreateMeasurementDto
  ): Promise<Measurement> {
    try {
      return await this.measurementsService.createMeasurement(userId, measurement);
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
      return await this.measurementsService.findAllByCondition({ userId });
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
      return await this.measurementsService.findOneByConditionOrThrow({
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
    @Body() measurement: UpdateMeasurementDto
  ): Promise<Measurement> {
    try {
      return await this.measurementsService.updateMeasurement(userId, id, measurement);
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
      const [measurements]: [Measurement[], number] = await this.measurementsService.findAllByCondition({
        userId,
      });
      return await this.measurementsService.deleteManyByEntities(measurements);
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
      const measurement: Measurement = await this.measurementsService.findOneByConditionOrThrow({
        userId,
        id,
      });
      return await this.measurementsService.deleteOneByEntity(measurement);
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
      return await this.measurementsService.findAll(skip, take);
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
      return await this.measurementsService.findAllByIds(ids);
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
      const [measurements]: [Measurement[], number] = await this.measurementsService.findAllByIds(ids);
      return await this.measurementsService.deleteManyByEntities(measurements);
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
      const [measurements]: [Measurement[], number] = await this.measurementsService.findAllByCondition({
        userId,
      });
      return await this.measurementsService.deleteManyByEntities(measurements);
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
      const measurement: Measurement = await this.measurementsService.findOneByIdOrThrow(id);
      await this.measurementsService.updateOne(measurement.id, measurementPayload);
      return await this.measurementsService.findOneByIdOrThrow(measurement.id);
    } catch (error) {
      if (error instanceof EntityNotFound) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

}
