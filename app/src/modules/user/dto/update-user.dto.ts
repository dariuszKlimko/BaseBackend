import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsOptional } from "class-validator";

export class UpdateUserDto {
  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  height: number;
}
