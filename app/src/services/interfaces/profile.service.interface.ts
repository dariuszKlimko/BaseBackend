import { CreateProfileDto } from "@app/dtos/profile/create.profile.dto";
import { UpdateProfileDto } from "@app/dtos/profile/update.profile.dto";
import { Profile } from "@app/entities/profile.entity";
import { FindOptionsWhere, UpdateResult } from "typeorm";

export interface ProfileServiceIntrface {
  findOneByConditionOrThrow(condition: FindOptionsWhere<Profile>): Promise<Profile>;
  updateOne(id: string, profileInfo: UpdateProfileDto): Promise<UpdateResult>;
  findOneByIdOrThrow(id: string): Promise<Profile>;
  findAll(skip: number, take: number): Promise<[Profile[], number]>;
  findAllByIds(ids: string[]): Promise<[Profile[], number]>;
  findAllByCondition(condition: FindOptionsWhere<Profile>): Promise<[Profile[], number]>;
  createOne(profileInfo?: CreateProfileDto): Promise<Profile>;
}
