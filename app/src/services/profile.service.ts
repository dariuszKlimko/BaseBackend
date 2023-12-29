import { Injectable } from "@nestjs/common";
import { Profile } from "@app/entities/profile.entity";
import { UpdateProfileDto } from "@app/dtos/profile/update.profile.dto";
import { ProfileRepository } from "@app/repositories/profile.repository";
import { ProfileRepositoryInterface } from "@app/repositories/interfaces/profile.repository.interface";
import { ProfileServiceIntrface } from "@app/services/interfaces/profile.service.interface";

@Injectable()
export class ProfilesService implements ProfileServiceIntrface {
  private readonly profileRepository: ProfileRepositoryInterface;

  constructor(profileRepository: ProfileRepository) {
    this.profileRepository = profileRepository;
  }

  async getProfile(userId: string): Promise<Profile> {
    return await this.profileRepository.findOneByConditionOrThrow({ userId });
  }

  async updateProfile(userId: string, profileInfo: UpdateProfileDto): Promise<Profile> {
    return await this.profileRepository.updateOneByCondition({ userId }, profileInfo);
  }

  // async getAllProfilesByAdmin() - admin

  // async getProfilesByIdsByAdmin() - admin

  // async getProfilesWithConditionByAdmin()????? - admin
}
