import { BaseAbstractRepository } from "@app/common/repository/base.abstract.repository";
import { CreateProfileDto } from "@app/dtos/profile/create-profile.dto";
import { UpdateProfileDto } from "@app/dtos/profile/update-profile.dto";
import { Profile } from "@app/entities/profile.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProfileRepositoryInterface } from "./interfaces/profile.repository.interface";

export class ProfileRepository extends BaseAbstractRepository<Profile, CreateProfileDto, UpdateProfileDto> implements ProfileRepositoryInterface {
    constructor(@InjectRepository(Profile) private readonly profileRepository: Repository<Profile>) {
        super(profileRepository, "dddd");
    }
}