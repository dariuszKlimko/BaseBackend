import { PASSWORD_REGEX, weakPasswordMessage } from "@app/common/constans/password";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Matches } from "class-validator";

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @Matches(PASSWORD_REGEX, {
    message: weakPasswordMessage,
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
