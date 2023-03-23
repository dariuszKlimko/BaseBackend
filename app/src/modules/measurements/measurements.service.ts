import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Measurement } from "@app/modules/measurements/entities/measurement.entity";
import { Repository } from "typeorm";
import { CreateMeasurementDto } from "@app/modules/measurements/dto/create-measurement.dto";
import { UpdateMeasurementDto } from "@app/modules/measurements/dto/update-measurement.dto";

@Injectable()
export class MeasurementsService {
    constructor(@InjectRepository(Measurement) private measurementsService: Repository<Measurement>) {}

    async createMeasurement(userId: string, measurementPayload: CreateMeasurementDto): Promise<any> {

    }

    async getAllMeasurements(userId: string): Promise<any> {

    }

    async getOneMeasurement(userId: string, measurementId: string): Promise<any> {

    }

    async updateMeasurement(userId: string, measurementId: string, measurementPayload: UpdateMeasurementDto): Promise<any> {

    }

    async deleteUser(userIs: string, measurementId: string): Promise<any> {

    }
}