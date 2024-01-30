import { PASSWORD_REGEX, WEAK_PASSWORD_MESSAGE } from "@app/common/constans/constans";
import { Role } from "@app/common/types/role.enum";
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class CreateUserByAdminDto {
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

  @ApiProperty()
  @IsEnum(Role, { each: true })
  @IsString()
  role: Role.Admin_0 | Role.Admin_1 | Role.Admin_2;

  @ApiProperty()
  @IsBoolean()
  verified: boolean;
}
