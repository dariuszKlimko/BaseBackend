import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Profile } from "@app/entities/profile.entity";
import { UpdateProfileDto } from "@app/dtos/profile/update-profile.dto";
import { ProfileRepository } from "@app/repositories/profile.repository";
import { ProfileRepositoryInterface } from "@app/repositories/interfaces/profile.repository.interface";

@Injectable()
export class ProfilesService {
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


// @Injectable()
// export class ProfilesService {
//   constructor(@InjectRepository(Profile) private profileRepository: Repository<Profile>) {}

//   async getProfile(userId: string): Promise<Profile> {
//     const profile: Profile = await this.profileRepository.findOneBy({ userId });
//     return profile;
//   }

//   async updateProfile(userId: string, profileInfo: UpdateProfileDto): Promise<Profile> {
//     await this.profileRepository.update({ userId }, profileInfo);
//     const profile: Profile = await this.profileRepository.findOneBy({ userId });
//     return profile;
//   }

//   // async getAllProfilesByAdmin() - admin

//   // async getProfilesByIdsByAdmin() - admin

//   // async getProfilesWithConditionByAdmin()????? - admin
// }
