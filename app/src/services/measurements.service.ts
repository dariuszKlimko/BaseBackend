import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Measurement } from "@app/entities/measurement.entity";
import { Repository } from "typeorm";
import { CreateMeasurementDto } from "@app/dtos/measurement/create-measurement.dto";
import { UpdateMeasurementDto } from "@app/dtos/measurement/update-measurement.dto";
import { MeasurementNotFoundException } from "@app/common/exceptions/measurement/measurementNotFound.exception";
import { MessageInfo } from "@app/common/types/messageInfo";
import { ProfilesService } from "@app/services/profile.service";
import { Profile } from "@app/entities/profile.entity";
import { MEASUREMENTS_DELETED_RESPONSE } from "@app/common/constans/constans";
import { MeasurementRepository } from "@app/repositories/measurement.repository";
import { ProfileRepository } from "@app/repositories/profile.repository";
import { MeasurementRepositoryInterface } from "@app/repositories/interfaces/measurements.repository.interface";
import { ProfileRepositoryInterface } from "@app/repositories/interfaces/profile.repository.interface";

@Injectable()
export class MeasurementsService {
  private readonly measurementsRepository: MeasurementRepositoryInterface;
  private readonly profileRepository: ProfileRepositoryInterface;

  constructor(measurementsRepository: MeasurementRepository, profileRepository: ProfileRepository) {
    this.measurementsRepository = measurementsRepository;
    this.profileRepository = profileRepository;
  }

  async createMeasurement(userId: string, measurementPayload: CreateMeasurementDto): Promise<Measurement> {
    let bmi: number;
    const profile: Profile = await this.profileRepository.findOneByConditionOrThrow({ userId });
    const measurement: Measurement = await this.measurementsRepository.createOne(measurementPayload);
    measurement.userId = userId;
    if (profile.height) {
      bmi = measurementPayload.weight / Math.pow(profile.height / 100, 2);
      measurement.bmi = +bmi.toFixed(2);
    }
    return await this.measurementsRepository.saveOne(measurement);
  }

  async getAllMeasurementsByUserId(userId: string): Promise<Measurement[]> {
    return await this.measurementsRepository.findAllByCondition({ userId });
  }

  async getOneMeasurement(userId: string, measurementId: string): Promise<Measurement> {
    const measurement: Measurement = await this.measurementsRepository.findOneByConditionOrThrow({
      userId,
      id: measurementId,
    });
    if (!measurement) {
      throw new MeasurementNotFoundException("incorrect measuremet or user id");
    }
    return measurement;
  }

  async updateMeasurement(
    userId: string,
    measurementId: string,
    measurementPayload: UpdateMeasurementDto
  ): Promise<Measurement> {
    const measurement: Measurement = await this.measurementsRepository.findOneByConditionOrThrow({
      userId,
      id: measurementId,
    });
    if (!measurement) {
      throw new MeasurementNotFoundException("incorrect measuremet or user id");
    }
    await this.measurementsRepository.updateOneByCondition({ userId, id: measurementId }, measurementPayload);
    return await this.measurementsRepository.findOneByConditionOrThrow({ userId, id: measurementId });
  }

  async deleteAllMeasurementsByUserId(userId: string): Promise<MessageInfo> {
    const measurements: Measurement[] = await this.measurementsRepository.findAllByCondition({ userId });
    if (measurements.length === 0) {
      throw new MeasurementNotFoundException("measurements for given user id not found");
    }
    await this.measurementsRepository.deleteManyByCondition({ userId });
    return MEASUREMENTS_DELETED_RESPONSE;
  }

  async deleteOneMeasurement(userId: string, measurementId: string): Promise<Measurement> {
    const measurement: Measurement = await this.measurementsRepository.findOneByConditionOrThrow({
      userId,
      id: measurementId,
    });
    if (!measurement) {
      throw new MeasurementNotFoundException("incorrect measuremet or user id");
    }
    await this.measurementsRepository.deleteOneByCondition({ userId, id: measurementId });
    return measurement;
  }
// ---------------------------------------------------------------
// Admin
  async getAllMeasurementsByAdmin(): Promise<Measurement[]> {
    return await this.measurementsRepository.findAll();
  }
// Admin
  async getAllMeasurementsByIdsByAdmin(ids: string[]): Promise<Measurement[]> {
    return await this.measurementsRepository.findAllByIds(ids);
  }
// Admin
  async deleteMeasurementsByIdsByAdmin(ids: string[]): Promise<Measurement[]> {
    return await this.measurementsRepository.deleteManyByIds(ids);
  }
// Admin
  async deleteMeasurementsByUserIdByAdmin(userId: string): Promise<Measurement[]> {
    return await this.measurementsRepository.deleteManyByCondition({ userId});
  }
// Admin
  async updateMeasurementByIdByAdmin(id: string, measurementPayload: UpdateMeasurementDto ): Promise<Measurement> {
    return await this.measurementsRepository.updateOneById(id, measurementPayload);
  }
}



// @Injectable()
// export class MeasurementsService {
//   constructor(
//     @InjectRepository(Measurement) private measurementsRepository: Repository<Measurement>,
//     private profilesService: ProfilesService
//   ) {}

//   async createMeasurement(userId: string, measurementPayload: CreateMeasurementDto): Promise<Measurement> {
//     let bmi: number;
//     const profile: Profile = await this.profilesService.getProfile(userId);
//     const measurement: Measurement = await this.measurementsRepository.create(measurementPayload);
//     measurement.userId = userId;
//     if (profile.height) {
//       bmi = measurementPayload.weight / Math.pow(profile.height / 100, 2);
//       measurement.bmi = +bmi.toFixed(2);
//     }
//     return await this.measurementsRepository.save(measurement);
//   }

//   async getAllMeasurements(userId: string): Promise<Measurement[]> {
//     return await this.measurementsRepository.findBy({ userId });
//   }

//   async getOneMeasurement(userId: string, measurementId: string): Promise<Measurement> {
//     const measurement: Measurement = await this.measurementsRepository.findOneBy({
//       userId,
//       id: measurementId,
//     });
//     if (!measurement) {
//       throw new MeasurementNotFoundException("incorrect measuremet or user id");
//     }
//     return measurement;
//   }

//   async updateMeasurement(
//     userId: string,
//     measurementId: string,
//     measurementPayload: UpdateMeasurementDto
//   ): Promise<Measurement> {
//     const measurement: Measurement = await this.measurementsRepository.findOneBy({
//       userId,
//       id: measurementId,
//     });
//     if (!measurement) {
//       throw new MeasurementNotFoundException("incorrect measuremet or user id");
//     }
//     await this.measurementsRepository.update({ userId, id: measurementId }, measurementPayload);
//     return await this.measurementsRepository.findOneBy({ userId, id: measurementId });
//   }

//   async deleteAllMeasurementsByUserId(userId: string): Promise<MessageInfo> {
//     const measurements: Measurement[] = await this.measurementsRepository.findBy({ userId });
//     if (measurements.length === 0) {
//       throw new MeasurementNotFoundException("measurements for given user id not found");
//     }
//     await this.measurementsRepository.delete({ userId });
//     return MEASUREMENTS_DELETED_RESPONSE;
//   }

//   async deleteOneMeasurement(userId: string, measurementId: string): Promise<Measurement> {
//     const measurement: Measurement = await this.measurementsRepository.findOneBy({
//       userId,
//       id: measurementId,
//     });
//     if (!measurement) {
//       throw new MeasurementNotFoundException("incorrect measuremet or user id");
//     }
//     await this.measurementsRepository.delete({ userId, id: measurementId });
//     return measurement;
//   }

//   // async getAllMeasurementsByAdmin() - admin

//   // async getMeasurementsByIdsByAdmin() - admin

//   // async getMeasurementsWithConditionByAdmin()????? - admin

//   // async deleteMeasurementsByIdsByAdmin() - admin

//   // async updateMeasurementsByAdmin() - admin
// }
