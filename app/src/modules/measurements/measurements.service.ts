import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Measurement } from "@app/modules/measurements/entities/measurement.entity";
import { Repository } from "typeorm";
import { CreateMeasurementDto } from "@app/modules/measurements/dto/create-measurement.dto";
import { UpdateMeasurementDto } from "@app/modules/measurements/dto/update-measurement.dto";
import { UsersService } from "@app/modules/user/user.service";
import { MeasurementNotFoundException } from "./exceptions/measurementNotFound.exception";
import { MeasurementResponseDto } from "./dto/measurementResponse.dto";
import { MessageInfo } from "@app/common/types/messageInfo";

@Injectable()
export class MeasurementsService {
    constructor(@InjectRepository(Measurement) private measurementsRepository: Repository<Measurement>, private usersService: UsersService) {}

    async createMeasurement(userId: string, measurementPayload: CreateMeasurementDto): Promise<MeasurementResponseDto> {
        const user = await this.usersService.getUser(userId);
        let bmi: number;
        const measurement = await this.measurementsRepository.create(measurementPayload);
        measurement.userId = userId;
        if(user.height) {
            bmi = measurementPayload.weight / Math.pow(user.height/100,2);
            measurement.bmi = +bmi.toFixed(2);
        }
        return await this.measurementsRepository.save(measurement);
    }

    async getAllMeasurements(userId: string): Promise<MeasurementResponseDto[]> {
        return await this.measurementsRepository.findBy({ userId });
    }

    async getOneMeasurement(userId: string, measurementId: string): Promise<MeasurementResponseDto> {
        const measurement = await this.measurementsRepository.findOneBy({userId, id: measurementId  })
        if(!measurement) {
            throw new MeasurementNotFoundException("measurement with given id not exist in database ")
        }
        return measurement;
    }

    async updateMeasurement(userId: string, measurementId: string, measurementPayload: UpdateMeasurementDto): Promise<MeasurementResponseDto> {
        const measurement = await this.measurementsRepository.findOneBy({userId, id: measurementId })
        if(!measurement) {
            throw new MeasurementNotFoundException("measurement with given id not exist in database ")
        }
        console.log(measurementPayload);
        await this.measurementsRepository.update({userId, id: measurementId }, measurementPayload );
        return await this.measurementsRepository.findOneBy({userId, id: measurementId });
    }

    async deleteAllMeasurementsByUserId(userId: string): Promise<MessageInfo> {
        const measurements = await this.measurementsRepository.findBy({userId});
        if(measurements.length === 0) {
            throw new MeasurementNotFoundException("measurements not found for given id");
        }
        await this.measurementsRepository.delete({userId});
        return {status: "ok", message: "all measurements deleted"};
    }

    async deleteOneMeasurement(userId: string, measurementId: string): Promise<MeasurementResponseDto> {
        const measurement = await this.measurementsRepository.findOneBy({userId, id: measurementId })
        if(!measurement) {
            throw new MeasurementNotFoundException("wrong user id or measurement id")
        }
        await this.measurementsRepository.delete({userId, id: measurementId })
        return measurement;
    }
}