import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateUserDto {
  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @IsOptional()
  password: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  height: number;
}
