import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
import { ApiBearerAuth, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Measurement } from "@app/entities/measurement.entity";
import { EntityNotFound } from "@app/common/exceptions/entity.not.found.exception";
import { AddUserToRequest } from "@app/common/interceptors/add.user.to.request.interceptor";

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
  // @ApiResponse({
  //   status: 201,
  //   type: Measurement,
  //   description: "measurement has been successfully created",
  // })
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
  // @ApiResponse({
  //   status: 200,
  //   type: [Measurement],
  //   description: "all measurements has been successfully loaded",
  // })
  @ApiOkResponse({ description: "Success.", type: [Measurement] })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AddUserToRequest)
  @Get()
  async getAllMeasurementsByUserId(@UserId() userId: string): Promise<[Measurement[], number]> {
    try {
      return await this.measurementsService.getAllMeasurementsByUserId(userId);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "Get measurement by id." })
  // @ApiResponse({
  //   status: 200,
  //   type: Measurement,
  //   description: "one measurement been successfully loaded",
  // })
  @ApiOkResponse({ description: "Success.", type: Measurement })
  @ApiNotFoundResponse({ description: "Measurement not found" })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AddUserToRequest)
  @Get(":id")
  async getOneMeasurement(@UserId() userId: string, @Param("id", ParseUUIDPipe) id: string): Promise<Measurement> {
    try {
      return await this.measurementsService.getOneMeasurement(userId, id);
    } catch (error) {
      if (error instanceof EntityNotFound) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "Update measurement by id." })
  // @ApiResponse({
  //   status: 200,
  //   type: Measurement,
  //   description: "measurement has been successfully updated",
  // })
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
  // @ApiResponse({
  //   status: 200,
  //   type: [Measurement],
  //   description: "all user's measurement has been successfully deleted",
  // })
  @ApiOkResponse({ description: "Success.", type: [Measurement] })
  @ApiNotFoundResponse({ description: "Measurements not found" })
  @ApiInternalServerErrorResponse({ description: "Internal server error." })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AddUserToRequest)
  @Delete()
  async deleteAllMeasurementsByUserId(@UserId() userId: string): Promise<Measurement[]> {
    try {
      return await this.measurementsService.deleteAllMeasurementsByUserId(userId);
    } catch (error) {
      if (error instanceof EntityNotFound) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "Delete measurement by id." })
  // @ApiResponse({
  //   status: 200,
  //   type: Measurement,
  //   description: "one measurement has been successfully deleted",
  // })
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
      return await this.measurementsService.deleteOneMeasurement(userId, id);
    } catch (error) {
      if (error instanceof EntityNotFound) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }
}
