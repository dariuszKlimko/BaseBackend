import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Measurement } from "@app/modules/measurements/entities/measurement.entity";
import { MeasurementsController } from "@app/modules/measurements/measurements.controller";
import { MeasurementsService } from "@app/modules/measurements/measurements.service";
import { UserModule } from "../user/user.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Measurement]),
    UserModule
  ],
  controllers: [MeasurementsController],
  providers: [MeasurementsService],
  exports: [MeasurementsService],
})
export class MeasurementModule {}