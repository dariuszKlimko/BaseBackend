import { Injectable, Logger } from "@nestjs/common";
import { Profile } from "@app/entities/profile.entity";
import { UpdateProfileDto } from "@app/dtos/profile/update.profile.dto";
import { ProfileRepository } from "@app/repositories/profile.repository";
import { ProfileRepositoryInterface } from "@app/repositories/interfaces/profile.repository.interface";
import { ProfileServiceIntrface } from "@app/services/interfaces/profile.service.interface";
import { FindOptionsWhere, UpdateResult } from "typeorm";
import { CreateProfileDto } from "@app/dtos/profile/create.profile.dto";

@Injectable()
export class ProfileService implements ProfileServiceIntrface {
  private readonly logger: Logger = new Logger(ProfileService.name);
  private readonly profileRepository: ProfileRepositoryInterface;

  constructor(profileRepository: ProfileRepository) {
    this.profileRepository = profileRepository;
  }

  async findOneByConditionOrThrow(condition: FindOptionsWhere<Profile>): Promise<Profile> {
    return await this.profileRepository.findOneByConditionOrThrow(condition);
  }

  async updateOne(id: string, profileInfo: UpdateProfileDto): Promise<UpdateResult> {
    return await this.profileRepository.updateOne(id, profileInfo);
  }

  async findOneByIdOrThrow(id: string): Promise<Profile> {
    return await this.profileRepository.findOneByIdOrThrow(id);
  }

  async findAll(skip: number, take: number): Promise<[Profile[], number]> {
    return await this.profileRepository.findAll(skip, take);
  }

  async findAllByIds(ids: string[]): Promise<[Profile[], number]> {
    return await this.profileRepository.findAllByIds(ids);
  }

  async findAllByCondition(condition: FindOptionsWhere<Profile>): Promise<[Profile[], number]> {
    return await this.profileRepository.findAllByCondition(condition);
  }

  async createOne(profileInfo?: CreateProfileDto): Promise<Profile> {
    return await this.profileRepository.createOne(profileInfo);
  }
}
