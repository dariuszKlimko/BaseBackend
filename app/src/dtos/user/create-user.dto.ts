import { PASSWORD_REGEX, WEAK_PASSWORD_MESSAGE } from "@app/common/constans/constans";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @Matches(PASSWORD_REGEX, {
    message: WEAK_PASSWORD_MESSAGE,
  })
  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  password: string;
}
