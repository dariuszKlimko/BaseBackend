import { PartialType } from "@nestjs/swagger";
import { CreateProfileDto } from "@app/dtos/profile/create.profile.dto";

export class UpdateProfileDto extends PartialType(CreateProfileDto) {}
