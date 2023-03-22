import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateMeasurementDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    weight: number;

    @ApiProperty()
    @IsNumber()
    caloriesDelivered: number;

    @ApiProperty()
    @IsNumber()
    distanceTraveled: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    measurementDate: string;
}