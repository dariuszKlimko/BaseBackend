import { CreateMeasurementDto } from "@app/dtos/measurement/create.measurement.dto";
import { UpdateMeasurementDto } from "@app/dtos/measurement/update.measurement.dto";
import { Measurement } from "@app/entities/measurement.entity";

export interface MeasurementServiceIntrface {
  createMeasurement(userId: string, measurementPayload: CreateMeasurementDto): Promise<Measurement>;
  getAllMeasurementsByUserId(userId: string): Promise<[Measurement[], number]>;
  getOneMeasurement(userId: string, measurementId: string): Promise<Measurement>;
  updateMeasurement(
    userId: string,
    measurementId: string,
    measurementPayload: UpdateMeasurementDto
  ): Promise<Measurement>;
  deleteAllMeasurementsByUserId(userId: string): Promise<Measurement[]>;
  deleteOneMeasurement(userId: string, measurementId: string): Promise<Measurement>;
  // ---------------------------------------------------------------
  // Admin
  getAllMeasurementsByAdmin(): Promise<[Measurement[], number]>;
  // Admin
  getAllMeasurementsByIdsByAdmin(ids: string[]): Promise<[Measurement[], number]>;
  // Admin
  deleteMeasurementsByIdsByAdmin(ids: string[]): Promise<Measurement[]>;
  // Admin
  deleteMeasurementsByUserIdByAdmin(userId: string): Promise<Measurement[]>;
  // Admin
  updateMeasurementByIdByAdmin(id: string, measurementPayload: UpdateMeasurementDto): Promise<Measurement>;
}
