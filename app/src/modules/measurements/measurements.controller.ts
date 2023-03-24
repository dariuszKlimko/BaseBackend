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
  UsePipes,
  ValidationPipe,
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
import { MeasurementResponseDto } from "@app/modules/measurements/dto/measurement-response.dto";
import { MessageInfo } from "@app/common/dto/messageInfo";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("measurements")
@UseFilters(HttpExceptionFilter)
@Controller("measurements")
export class MeasurementsController {
  constructor(private measurementsService: MeasurementsService) {}

  @ApiOperation({ summary: "create measuremet" })
  @ApiResponse({
    status: 201,
    type: MeasurementResponseDto,
    description: "measurement has been successfully created",
  })
  @ApiResponse({ status: 400, description: "data validation" })
  @ApiResponse({ status: 401, description: "unauthorized" })
  @ApiBearerAuth()
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
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

  @ApiOperation({ summary: "get all measurement for given user" })
  @ApiResponse({
    status: 200,
    type: [MeasurementResponseDto],
    description: "all measurements has been successfully loaded",
  })
  @ApiResponse({ status: 401, description: "unauthorized" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllMeasurements(@CurrentUser() user: CurrentUserDecorator): Promise<MeasurementResponseDto[]> {
    try {
      return await this.measurementsService.getAllMeasurements(user.id);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({ summary: "get measurement by id" })
  @ApiResponse({
    status: 200,
    type: MeasurementResponseDto,
    description: "one measurement been successfully loaded",
  })
  @ApiResponse({ status: 401, description: "unauthorized" })
  @ApiResponse({ status: 404, description: "measurement not found" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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

  @ApiOperation({ summary: "update measurement by id" })
  @ApiResponse({
    status: 200,
    type: MeasurementResponseDto,
    description: "measurement has been successfully updated",
  })
  @ApiResponse({ status: 400, description: "data validation" })
  @ApiResponse({ status: 401, description: "unauthorized" })
  @ApiResponse({ status: 404, description: "measurement not found" })
  @ApiBearerAuth()
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
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

  @ApiOperation({ summary: "delete all measurements for given user" })
  @ApiResponse({
    status: 200,
    type: MessageInfo,
    description: "all user's measurement has been successfully deleted",
  })
  @ApiResponse({ status: 401, description: "unauthorized" })
  @ApiResponse({ status: 404, description: "measurements not found" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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

  @ApiOperation({ summary: "delete measurement by id" })
  @ApiResponse({
    status: 200,
    type: MeasurementResponseDto,
    description: "one measurement has been successfully deleted",
  })
  @ApiResponse({ status: 401, description: "unauthorized" })
  @ApiResponse({ status: 404, description: "measurement not found" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
