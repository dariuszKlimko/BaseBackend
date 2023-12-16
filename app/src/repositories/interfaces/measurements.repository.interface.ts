import { BaseInterfaceRepository } from "@app/common/repository/base.interface.repository";
import { Measurement } from "@app/entities/measurement.entity";

export interface MeasurementRepositoryInterface extends BaseInterfaceRepository<Measurement> {}
