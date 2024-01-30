import { UpdateProfileDto } from "@app/dtos/profile/update.profile.dto";
import { Profile } from "@app/entities/profile.entity";
import { UpdateResult } from "typeorm";

export interface ProfileServiceIntrface {
  getProfile(userId: string): Promise<Profile>;
  // ---------------------------------------
  findByProfileByUserId(userId: string): Promise<Profile>;
  findProfileById(id: string): Promise<Profile>;
  updateProfile(profileId: string, profileInfo: UpdateProfileDto): Promise<UpdateResult>;
  getAllProfilesByAdmin(skip: number, take: number): Promise<[Profile[], number]>;
  getProfilesByIdsByAdmin(ids: string[]): Promise<[Profile[], number]>;
  getProfilesByUserIdsByAdmin(ids: string[]): Promise<[Profile[], number]>;
}
