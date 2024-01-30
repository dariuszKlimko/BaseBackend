import { Injectable } from "@nestjs/common";
import { Profile } from "@app/entities/profile.entity";
import { UpdateProfileDto } from "@app/dtos/profile/update.profile.dto";
import { ProfileRepository } from "@app/repositories/profile.repository";
import { ProfileRepositoryInterface } from "@app/repositories/interfaces/profile.repository.interface";
import { ProfileServiceIntrface } from "@app/services/interfaces/profile.service.interface";
import { In, UpdateResult } from "typeorm";

@Injectable()
export class ProfilesService implements ProfileServiceIntrface {
  private readonly profileRepository: ProfileRepositoryInterface;

  constructor(profileRepository: ProfileRepository) {
    this.profileRepository = profileRepository;
  }

  async getProfile(userId: string): Promise<Profile> {
    return await this.profileRepository.findOneByConditionOrThrow({ userId });
  }

  // ----------------------------------------------------------------------------------
  async findByProfileByUserId(userId: string): Promise<Profile> {
    return await this.profileRepository.findOneByConditionOrThrow({ userId });
  }

  async findProfileById(id: string): Promise<Profile> {
    return await this.profileRepository.findOneByIdOrThrow(id);
  }

  async updateProfile(profileId: string, profileInfo: UpdateProfileDto): Promise<UpdateResult> {
    return await this.profileRepository.updateOne(profileId, profileInfo);
  }

  async getAllProfilesByAdmin(skip: number, take: number): Promise<[Profile[], number]> {
    return await this.profileRepository.findAll(skip, take);
  }

  async getProfilesByIdsByAdmin(ids: string[]): Promise<[Profile[], number]> {
    return await this.profileRepository.findAllByIds(ids);
  }

  async getProfilesByUserIdsByAdmin(userIds: string[]): Promise<[Profile[], number]> {
    return await this.profileRepository.findAllByCondition({ userId: In(userIds) });
  }
}
