import { CreateMeasurementDto } from "@app/dtos/measurement/create.measurement.dto";
import { UpdateMeasurementDto } from "@app/dtos/measurement/update.measurement.dto";
import { Measurement } from "@app/entities/measurement.entity";
import { FindOptionsWhere, UpdateResult } from "typeorm";

export interface MeasurementServiceIntrface {
  saveOneByEntity(measurement: Measurement): Promise<Measurement>;
  createOne(measurement: CreateMeasurementDto): Promise<Measurement>;
  findAllByCondition(condition: FindOptionsWhere<Measurement>): Promise<[Measurement[], number]>;
  deleteOneByEntity(measurement: Measurement): Promise<Measurement>;
  findOneByConditionOrThrow(condition: FindOptionsWhere<Measurement>): Promise<Measurement>;
  findOneByIdOrThrow(id: string): Promise<Measurement>;
  updateOne(id: string, measurementInfo: UpdateMeasurementDto): Promise<UpdateResult>;
  findAllByIds(ids: string[]): Promise<[Measurement[], number]>;
  deleteManyByEntities(entities: Measurement[]): Promise<Measurement[]>;
  findAll(skip: number, take: number): Promise<[Measurement[], number]>;
}
