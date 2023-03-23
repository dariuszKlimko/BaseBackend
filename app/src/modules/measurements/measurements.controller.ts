import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseFilters,
  UseGuards,
} from "@nestjs/common";
import { MeasurementsService } from "@app/modules/measurements/measurements.service";
import { HttpExceptionFilter } from "@app/common/filter/HttpException.filter";
import { JwtAuthGuard } from "@app/common/guards/jwt-auth.guard";
import { CurrentUser } from "@app/common/decorators/currentUser.decorator";
import { CurrentUserDecorator } from "@app/common/types/currentUserDecorator";
import { MeasurementId } from "@app/modules/measurements/types/measurementId";
import { CreateMeasurementDto } from "@app/modules/measurements/dto/create-measurement.dto";
import { UpdateMeasurementDto } from "@app/modules/measurements/dto/update-measurement.dto";
import { MeasurementNotFoundException } from "@app/modules/measurements/exceptions/measurementNotFound.exception";
import { MeasurementResponseDto } from "@app/modules/measurements/dto/measurementResponse.dto";
import { MessageInfo } from "@app/common/types/messageInfo";

@Controller("measurements")
export class MeasurementsController {
  constructor(private measurementsService: MeasurementsService) {}

  @UseGuards(JwtAuthGuard)
  @UseFilters(HttpExceptionFilter)
  @Post()
  async createMeasurement(
    @CurrentUser() user: CurrentUserDecorator,
    @Body() measurement: CreateMeasurementDto
  ): Promise<MeasurementResponseDto> {
    try {
      return await this.measurementsService.createMeasurement(user.id, measurement);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @UseFilters(HttpExceptionFilter)
  @Get()
  async getAllMeasurements(@CurrentUser() user: CurrentUserDecorator): Promise<MeasurementResponseDto[]> {
    try {
      return await this.measurementsService.getAllMeasurements(user.id);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @UseFilters(HttpExceptionFilter)
  @Get("/:id")
  async getOneMeasurement(
    @CurrentUser() user: CurrentUserDecorator,
    @Param() measurementId: MeasurementId
  ): Promise<MeasurementResponseDto> {
    try {
      return await this.measurementsService.getOneMeasurement(user.id, measurementId.id);
    } catch (error) {
      if (error instanceof MeasurementNotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @UseFilters(HttpExceptionFilter)
  @Patch("/:id")
  async updateMeasurement(
    @CurrentUser() user: CurrentUserDecorator,
    @Param() measurementId: MeasurementId,
    @Body() measurement: UpdateMeasurementDto
  ): Promise<MeasurementResponseDto> {
    try {
      return await this.measurementsService.updateMeasurement(user.id, measurementId.id, measurement);
    } catch (error) {
      if (error instanceof MeasurementNotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @UseFilters(HttpExceptionFilter)
  @Delete()
  async deleteAllMeasurementsByUserId(@CurrentUser() user: CurrentUserDecorator): Promise<MessageInfo> {
    try {
      return await this.measurementsService.deleteAllMeasurementsByUserId(user.id);
    } catch (error) {
      if (error instanceof MeasurementNotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @UseFilters(HttpExceptionFilter)
  @Delete("/:id")
  async deleteOneMeasurement(
    @CurrentUser() user: CurrentUserDecorator,
    @Param() measurementId: MeasurementId
  ): Promise<MeasurementResponseDto> {
    try {
      return await this.measurementsService.deleteOneMeasurement(user.id, measurementId.id);
    } catch (error) {
      if (error instanceof MeasurementNotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }
}
