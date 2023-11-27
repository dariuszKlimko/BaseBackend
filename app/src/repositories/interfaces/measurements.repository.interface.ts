import { BaseInterfaceRepository } from "@app/common/repository/base.interface.repository";
import { CreateMeasurementDto } from "@app/dtos/measurement/create-measurement.dto";
import { UpdateMeasurementDto } from "@app/dtos/measurement/update-measurement.dto";
import { Measurement } from "@app/entities/measurement.entity";

export interface MeasurementRepositoryInterface
  extends BaseInterfaceRepository<Measurement, CreateMeasurementDto, UpdateMeasurementDto> {}
