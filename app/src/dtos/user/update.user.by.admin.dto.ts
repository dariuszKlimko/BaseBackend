import { Role } from "@app/common/types/role.enum";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString } from "class-validator";

export class UpdateUserByAdminDto {
  @ApiProperty()
  @IsEnum(Role, { each: true })
  @IsString()
  role: Role.Admin_1 | Role.Admin_2;
}
