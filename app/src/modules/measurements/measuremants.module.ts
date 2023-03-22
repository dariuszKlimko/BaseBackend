import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Measurements } from "@app/modules/measurements/entities/measurements.entity";
import { MeasurementsController } from "@app/modules/measurements/measurements.controller";
import { MeasurementsService } from "@app/modules/measurements/measurements.service";

@Module({
  imports: [TypeOrmModule.forFeature([Measurements])],
  controllers: [MeasurementsController],
  providers: [MeasurementsService],
  exports: [MeasurementsService],
})
export class MeasurementModule {}