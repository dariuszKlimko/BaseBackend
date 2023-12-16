import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional } from "class-validator";

export class CreateProfileDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  height: number;
}
