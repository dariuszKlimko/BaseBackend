import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class UpdateMeasurementDto {
    @ApiProperty()
    @IsNumber()
    weight: number;

    @ApiProperty()
    @IsNumber()
    caloriesDelivered: number;

    @ApiProperty()
    @IsNumber()
    distanceTraveled: number;

    @ApiProperty()
    @IsString()
    measurementDate: string;
}