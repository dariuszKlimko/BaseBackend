import { BaseAbstractRepository } from "@app/common/repository/base.abstract.repository";
import { Profile } from "@app/entities/profile.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProfileRepositoryInterface } from "@app/common/types/interfaces/repositories/profile.repository.interface";
import { PROFILE_NOT_FOUND } from "@app/common/constans/constans";

export class ProfileRepository extends BaseAbstractRepository<Profile> implements ProfileRepositoryInterface {
  constructor(@InjectRepository(Profile) profileRepository: Repository<Profile>) {
    super(profileRepository, PROFILE_NOT_FOUND);
  }
}
