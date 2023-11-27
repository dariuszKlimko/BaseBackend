import { BaseInterfaceRepository } from "@app/common/repository/base.interface.repository";
import { CreateProfileDto } from "@app/dtos/profile/create-profile.dto";
import { UpdateProfileDto } from "@app/dtos/profile/update-profile.dto";
import { Profile } from "@app/entities/profile.entity";

export interface ProfileRepositoryInterface
  extends BaseInterfaceRepository<Profile, CreateProfileDto, UpdateProfileDto> {}
