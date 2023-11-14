import { PASSWORD_REGEX, weakPasswordMessage } from "@app/common/constans/password";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, Matches } from "class-validator";

export class UpdateUserDto {
  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty()
  @Matches(PASSWORD_REGEX, {
    message: weakPasswordMessage,
  })
  @IsString()
  @IsOptional()
  password: string;
}
