import { Injectable } from "@nestjs/common";
import { Measurement } from "@app/entities/measurement.entity";
import { MeasurementRepository } from "@app/repositories/measurement.repository";
import { MeasurementServiceIntrface } from "@app/services/interfaces/measurement.service.interface";
import { BaseAbstractService } from "@app/common/service/base.abstract.service";

@Injectable()
export class MeasurementService extends BaseAbstractService<Measurement> implements MeasurementServiceIntrface {
  constructor(measurementsRepository: MeasurementRepository) {
    super(measurementsRepository);
  }
}
