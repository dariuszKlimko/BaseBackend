import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Profile } from "@app/entities/profile.entity";
import { UpdateProfileDto } from "@app/dtos/profile/update-profile.dto";

@Injectable()
export class ProfilesService {
  constructor(@InjectRepository(Profile) private profileRepository: Repository<Profile>) {}

  async getProfile(userId: string): Promise<Profile> {
    const profile: Profile = await this.profileRepository.findOneBy({ userId });
    return profile;
  }

  async updateProfile(userId: string, profileInfo: UpdateProfileDto): Promise<Profile> {
    await this.profileRepository.update({ userId }, profileInfo);
    const profile: Profile = await this.profileRepository.findOneBy({ userId });
    return profile;
  }

  // async getAllProfilesByAdmin() - admin

  // async getProfilesByIdsByAdmin() - admin

  // async getProfilesWithConditionByAdmin()????? - admin
}
