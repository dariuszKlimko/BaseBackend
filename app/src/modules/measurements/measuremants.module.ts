import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Measurement } from "@app/modules/measurements/entities/measurement.entity";
import { MeasurementsController } from "@app/modules/measurements/measurements.controller";
import { MeasurementsService } from "@app/modules/measurements/measurements.service";

@Module({
  imports: [TypeOrmModule.forFeature([Measurement])],
  controllers: [MeasurementsController],
  providers: [MeasurementsService],
  exports: [MeasurementsService],
})
export class MeasurementModule {}