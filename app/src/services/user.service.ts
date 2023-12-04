import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { User } from "@app/entities/user.entity";
import { CreateUserDto } from "@app/dtos/user/create-user.dto";
import { UserDuplicatedException } from "@app/common/exceptions/user/userDuplicated.exception";
import { Profile } from "@app/entities/profile.entity";
import { UserRepository } from "@app/repositories/user.repository";
import { UserRepositoryIntrface } from "@app/repositories/interfaces/user.repository.interface";
import { UpdateUserDto } from "@app/dtos/user/update-user.dto";
import { ProfileRepositoryInterface } from "@app/repositories/interfaces/profile.repository.interface";
import { ProfileRepository } from "@app/repositories/profile.repository";

@Injectable()
export class UsersService {
  private readonly userRepository: UserRepositoryIntrface;
  private readonly profileRepository: ProfileRepositoryInterface;

  constructor(userRepository: UserRepository, profileRepository: ProfileRepository) {
    this.userRepository = userRepository;
    this.profileRepository = profileRepository;
  }

  async getUser(id: string): Promise<User> {
    const user: User = await this.userRepository.findOneByIdOrThrow(id);
    return user;
  }

  async registerUser(userInfo: CreateUserDto): Promise<User> {
    const user: User = await this.userRepository.findOneByCondition({ email: userInfo.email });
    if (user) {
      throw new UserDuplicatedException("user with given email address aldeady exist in database");
    }
    const userPayload: User = await this.userRepository.createOne(userInfo);
    const profile: Profile = await this.profileRepository.createOne();
    userPayload.profile = profile;
    await this.userRepository.saveOne(userPayload);
    return userPayload;
  }

  async deleteUser(id: string): Promise<User> {
    return await this.userRepository.deleteOneById(id);
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



// @Injectable()
// export class UsersService {
//   constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

//   async getUser(id: string): Promise<User> {
//     const user: User = await this.userRepository.findOneBy({ id });
//     return user;
//   }

//   async registerUser(userInfo: CreateUserDto): Promise<User> {
//     const user: User = await this.userRepository.findOneBy({ email: userInfo.email });
//     if (user) {
//       throw new UserDuplicatedException("user with given email address aldeady exist in database");
//     }
//     const userPayload: User = this.userRepository.create(userInfo);
//     const profile: Profile = new Profile();
//     userPayload.profile = profile;
//     await this.userRepository.save(userPayload);
//     return userPayload;
//   }

//   async deleteUser(id: string): Promise<User> {
//     const user: User = await this.userRepository.findOneBy({ id });
//     await this.userRepository.delete(id);
//     return user;
//   }

//   // async updateUser()

//   // async getAllUsersByAdmin() - admin

//   // async getUsersByIdsByAdmin() - admin

//   // async getUsersWithConditionByAdmin()????? - admin

//   // async getUserWithRelationByAdmin() - admin

//   // async deleteUsersByIdsByAdmin() - admin

//   // async createUserByAdmin() - admin

//   // async updateUserByAdmin() - admin
// }
