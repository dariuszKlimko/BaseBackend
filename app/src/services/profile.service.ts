import { Injectable } from "@nestjs/common";
import { Profile } from "@app/entities/profile.entity";
import { ProfileRepository } from "@app/repositories/profile.repository";
import { ProfileServiceIntrface } from "@app/common/types/interfaces/services/profile.service.interface";
import { BaseAbstractService } from "@app/common/services/base.abstract.service";

@Injectable()
export class ProfileService extends BaseAbstractService<Profile> implements ProfileServiceIntrface {
  constructor(profileRepository: ProfileRepository) {
    super(profileRepository);
  }
}
