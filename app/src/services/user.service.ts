import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "@app/entities/user.entity";
import { CreateUserDto } from "@app/dtos/user/create-user.dto";
import { UserDuplicatedException } from "@app/common/exceptions/user/userDuplicated.exception";
import { Profile } from "@app/entities/profile.entity";

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  async getUser(id: string): Promise<User> {
    const user: User = await this.userRepository.findOneBy({ id });
    return user;
  }

  async registerUser(userInfo: CreateUserDto): Promise<User> {
    const user: User = await this.userRepository.findOneBy({ email: userInfo.email });
    if (user) {
      throw new UserDuplicatedException("user with given email address aldeady exist in database");
    }
    const userPayload: User = this.userRepository.create(userInfo);
    const profile: Profile = new Profile();
    userPayload.profile = profile;
    await this.userRepository.save(userPayload);
    return userPayload;
  }

  async deleteUser(id: string): Promise<User> {
    const user: User = await this.userRepository.findOneBy({ id });
    await this.userRepository.delete(id);
    return user;
  }

  // async updateUser()

  // async getAllUsersByAdmin() - admin

  // async getUsersByIdsByAdmin() - admin

  // async getUsersWithConditionByAdmin()????? - admin

  // async getUserWithRelationByAdmin() - admin

  // async deleteUsersByIdsByAdmin() - admin

  // async createUserByAdmin() - admin

  // async updateUserByAdmin() - admin
}
