import { BaseInterfaceService } from "@app/common/services/base.interface.service";
import { Measurement } from "@app/entities/measurement.entity";

export interface MeasurementServiceIntrface extends BaseInterfaceService<Measurement> {}
