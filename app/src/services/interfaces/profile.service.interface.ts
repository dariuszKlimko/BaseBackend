import { UpdateProfileDto } from "@app/dtos/profile/update.profile.dto";
import { Profile } from "@app/entities/profile.entity";

export interface ProfileServiceIntrface {
  getProfile(userId: string): Promise<Profile>;
  updateProfile(userId: string, profileInfo: UpdateProfileDto): Promise<Profile>;
}
