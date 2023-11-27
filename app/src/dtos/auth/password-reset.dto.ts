import { PASSWORD_REGEX, WEAK_PASSWORD_MESSAGE } from "@app/common/constans/constans";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsNumber, IsString, Matches } from "class-validator";

export class ResetPasswordDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @Matches(PASSWORD_REGEX, {
    message: WEAK_PASSWORD_MESSAGE,
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  verificationCode: number;
}
