import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateMeasurementDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    weight: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    caloriesDelivered: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    distanceTraveled: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    measurementDate: string;
}