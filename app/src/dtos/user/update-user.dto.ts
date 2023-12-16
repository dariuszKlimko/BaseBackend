import { PartialType } from "@nestjs/swagger";
import { CreateUserDto } from "@app/dtos/user/create-user.dto";

export class UpdateUserDto extends PartialType(CreateUserDto) {}
