import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { MeasurementsService } from "@app/services/measurements.service";
import { HttpExceptionFilter } from "@app/common/filter/HttpException.filter";
import { JwtAuthGuard } from "@app/common/guards/jwt-auth.guard";
import { UserId } from "@app/common/decorators/userId.decorator";
import { CurrentUserDecorator } from "@app/common/types/currentUserDecorator";
import { CreateMeasurementDto } from "@app/dtos/measurement/create-measurement.dto";
import { UpdateMeasurementDto } from "@app/dtos/measurement/update-measurement.dto";
import { MeasurementNotFoundException } from "@app/common/exceptions/measurement/measurementNotFound.exception";
import { MessageInfo } from "@app/common/types/messageInfo";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Measurement } from "@app/entities/measurement.entity";
import { EntityNotFound } from "@app/common/exceptions/base/entityNotFound.exception";

@ApiTags("measurements")
@UseFilters(HttpExceptionFilter)
@Controller("measurements")
export class MeasurementsController {
  private readonly measurementsService: MeasurementsService;
  
  constructor(measurementsService: MeasurementsService) {
    this.measurementsService = measurementsService;
  }

  @ApiOperation({ summary: "create measuremet" })
  @ApiResponse({
    status: 201,
    type: Measurement,
    description: "measurement has been successfully created",
  })
  @ApiBearerAuth()
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
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

  @ApiOperation({ summary: "get all measurement for given user" })
  @ApiResponse({
    status: 200,
    type: [Measurement],
    description: "all measurements has been successfully loaded",
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllMeasurementsByUserId(@UserId() userId: string): Promise<Measurement[]> {
    try {
      return await this.measurementsService.getAllMeasurementsByUserId(userId);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "get measurement by id" })
  @ApiResponse({
    status: 200,
    type: Measurement,
    description: "one measurement been successfully loaded",
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async getOneMeasurement(
    @UserId() userId: string,
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<Measurement> {
    try {
      return await this.measurementsService.getOneMeasurement(userId, id);
    } catch (error) {
      if (error instanceof EntityNotFound) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "update measurement by id" })
  @ApiResponse({
    status: 200,
    type: Measurement,
    description: "measurement has been successfully updated",
  })
  @ApiBearerAuth()
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
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

  @ApiOperation({ summary: "delete all measurements for given user" })
  @ApiResponse({
    status: 200,
    type: MessageInfo,
    description: "all user's measurement has been successfully deleted",
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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

  @ApiOperation({ summary: "delete measurement by id" })
  @ApiResponse({
    status: 200,
    type: Measurement,
    description: "one measurement has been successfully deleted",
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
