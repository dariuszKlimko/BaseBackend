import { Injectable, Logger } from "@nestjs/common";
import { User } from "@app/entities/user.entity";
import { CreateUserDto } from "@app/dtos/user/create.user.dto";
import { UserDuplicatedException } from "@app/common/exceptions/user.duplicated.exception";
import { UserRepository } from "@app/repositories/user.repository";
import { UserRepositoryIntrface } from "@app/repositories/interfaces/user.repository.interface";
import { DULICATED_EXCEPTION_MESSAGE } from "@app/common/constans/exceptions.constans";
import { UserServiceIntrface } from "@app/services/interfaces/user.service.interface";
import { UpdateUserDto } from "@app/dtos/user/update.user.dto";
import { FindManyOptions, FindOptionsWhere, UpdateResult } from "typeorm";
import { VerificationCode } from "@app/common/types/verificationCode";
import { CreateUserByAdminDto } from "@app/dtos/user/create.user.by.admin.dto";
import { ProfileRepositoryInterface } from "@app/repositories/interfaces/profile.repository.interface";
import { ProfileRepository } from "@app/repositories/profile.repository";
import { Profile } from "@app/entities/profile.entity";
import { Role } from "@app/common/types/role.enum";

@Injectable()
export class UserService implements UserServiceIntrface {
  private readonly logger: Logger = new Logger(UserService.name);
  private readonly userRepository: UserRepositoryIntrface;
  private readonly profileRepository: ProfileRepositoryInterface;

  constructor(userRepository: UserRepository, profileRepository: ProfileRepository) {
    this.userRepository = userRepository;
    this.profileRepository = profileRepository;
  }

  mergeEntity(user: User, updateUserDto: UpdateUserDto): User {
    return this.userRepository.mergeEntity(user, updateUserDto);
  }

  async findOneByIdOrThrow(id: string): Promise<User> {
    return await this.userRepository.findOneByIdOrThrow(id);
  }

  async saveOneByEntity(user: User): Promise<User> {
    return await this.userRepository.saveOneByEntity(user);
  }

  async findAll(skip?: number, take?: number): Promise<[User[], number]> {
    return await this.userRepository.findAll(skip, take);
  }

  async findAllByIds(ids: string[], skip?: number, take?: number): Promise<[User[], number]> {
    return await this.userRepository.findAllByIds(ids, skip, take);
  }

  async deleteOneByEntity(user: User): Promise<User> {
    return await this.userRepository.deleteOneByEntity(user);
  }

  async findOpenQuery(query: FindManyOptions<User>): Promise<[User[], number]> {
    return await this.userRepository.findOpenQuery(query);
  }

  async deleteManyByEntities(users: User[]): Promise<User[]> {
    return await this.userRepository.deleteManyByEntities(users);
  }

  async createOne(userInfo?: CreateUserDto): Promise<User> {
    return await this.userRepository.createOne(userInfo);
  }

  async findOneByConditionOrThrow(condition: FindOptionsWhere<User> | FindOptionsWhere<User>[]): Promise<User> {
    return await this.userRepository.findOneByConditionOrThrow(condition);
  }

  // async updateOne(id: string, userInfo: UpdateUserDto): Promise<UpdateResult> {
  //   return await this.userRepository.updateOne(id, userInfo);
  // }
  // -------------------------------------------------------------
  async updateVerificationCode(id: string, userPayload: VerificationCode): Promise<UpdateResult> {
    return await this.userRepository.updateOne(id, userPayload);
  }

  async updateRoleByAdmin(id: string, role: Role.Admin_1 | Role.Admin_2): Promise<UpdateResult> {
    return await this.userRepository.updateOne(id, { role });
  }

  _checkIfUserExist(user: User): void {
    if (user) {
      throw new UserDuplicatedException(DULICATED_EXCEPTION_MESSAGE);
    }
  }

  async registerUser(userInfo: CreateUserDto | CreateUserByAdminDto): Promise<User> {
    const [users]: [User[], number] = await this.findOpenQuery({
      where: { email: userInfo.email },
    });
    this._checkIfUserExist(users[0]);
    const userPayload: User = await this.createOne(userInfo);
    const profile: Profile = await this.profileRepository.createOne();
    userPayload.profile = profile;
    await this.saveOneByEntity(userPayload);
    return userPayload;
  }
}
