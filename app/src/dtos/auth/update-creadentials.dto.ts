import { PASSWORD_REGEX, WEAK_PASSWORD_MESSAGE } from "@app/common/constans/constans";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, Matches } from "class-validator";

export class UpdateCredentialsDto {
  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty()
  @Matches(PASSWORD_REGEX, {
    message: WEAK_PASSWORD_MESSAGE,
  })
  @IsString()
  @IsOptional()
  password: string;
}


// update-user.dto
