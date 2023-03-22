import { Body, Controller, Delete, Get, InternalServerErrorException, Param, Patch, Post, UseFilters, UseGuards } from "@nestjs/common";
import { MeasurementsService } from "@app/modules/measurements/measurements.service";
import { HttpExceptionFilter } from "@app/common/filter/HttpException.filter";
import { JwtAuthGuard } from "@app/common/guards/jwt-auth.guard";
import { CurrentUser } from "@app/common/decorators/currentUser.decorator";
import { CurrentUserDecorator } from "@app/common/types/currentUserDecorator";
import { MeasurementId } from "@app/modules/measurements/types/measurementId";
import { CreateMeasurementDto } from "@app/modules/measurements/dto/create-measurement.dto";
import { UpdateMeasurementDto } from "@app/modules/measurements/dto/update-measurement.dto";

@Controller("measurements")
export class MeasurementsController {
    constructor(private measurementsService: MeasurementsService) {}

    @UseGuards(JwtAuthGuard)
    @UseFilters(HttpExceptionFilter)
    @Post()
    async createMeasurement(@CurrentUser() user: CurrentUserDecorator, @Body() measurement: CreateMeasurementDto): Promise<any> {
        try{
            return await  this.measurementsService.createMeasurement(user.id, measurement);
        } catch(error) {
            throw new InternalServerErrorException();
        }
    }

    @UseGuards(JwtAuthGuard)
    @UseFilters(HttpExceptionFilter)
    @Get()
    async getAllMeasurements(@CurrentUser() user: CurrentUserDecorator): Promise<any> {
        try{
            return await this.measurementsService.getAllMeasurements(user.id);
        } catch(error) {
            throw new InternalServerErrorException();
        }
    }

    @UseGuards(JwtAuthGuard)
    @UseFilters(HttpExceptionFilter)
    @Get("/:measurementId")
    async getOneMeasurement(@CurrentUser() user: CurrentUserDecorator, @Param() measurementId: MeasurementId): Promise<any> {
        try{
            return await this.measurementsService.getOneMeasurement(user.id, measurementId.id);
        } catch(error) {
            throw new InternalServerErrorException();
        }
    }

    @UseGuards(JwtAuthGuard)
    @UseFilters(HttpExceptionFilter)
    @Patch("/:measurementId")
    async updateMeasurement(@CurrentUser() user: CurrentUserDecorator, @Param() measurementId: MeasurementId, @Body() measurement: UpdateMeasurementDto): Promise<any> {
        try{
            return await this.measurementsService.updateMeasurement(user.id, measurementId.id, measurement);
        } catch(error) {
            throw new InternalServerErrorException();
        }
    }

    @UseGuards(JwtAuthGuard)
    @UseFilters(HttpExceptionFilter)
    @Delete("/:measurementId")
    async deleteUser(@CurrentUser() user: CurrentUserDecorator, @Param() measurementId: MeasurementId): Promise<any> {
        try{
            return await this.measurementsService.deleteUser(user.id, measurementId.id);
        } catch(error) {
            throw new InternalServerErrorException();
        }
    }
}