import { Injectable, Logger } from "@nestjs/common";
import { User } from "@app/entities/user.entity";
import { CreateUserDto } from "@app/dtos/user/create.user.dto";
import { UserDuplicatedException } from "@app/common/exceptions/user.duplicated.exception";
import { Profile } from "@app/entities/profile.entity";
import { UserRepository } from "@app/repositories/user.repository";
import { UserRepositoryIntrface } from "@app/repositories/interfaces/user.repository.interface";
import { ProfileRepositoryInterface } from "@app/repositories/interfaces/profile.repository.interface";
import { ProfileRepository } from "@app/repositories/profile.repository";
import { DULICATED_EXCEPTION_MESSAGE } from "@app/common/constans/exceptions.constans";
import { UserServiceIntrface } from "@app/services/interfaces/user.service.interface";
import { UpdateUserDto } from "@app/dtos/user/update.user.dto";
import { Role } from "@app/common/types/role.enum";
import { In } from "typeorm";

@Injectable()
export class UsersService implements UserServiceIntrface {
  private readonly logger: Logger = new Logger(UsersService.name);
  private readonly userRepository: UserRepositoryIntrface;
  private readonly profileRepository: ProfileRepositoryInterface;

  constructor(userRepository: UserRepository, profileRepository: ProfileRepository) {
    this.userRepository = userRepository;
    this.profileRepository = profileRepository;
  }

  async getUser(id: string): Promise<User> {
    return await this.userRepository.findOneByIdOrThrow(id);
  }

  async registerUser(userInfo: CreateUserDto): Promise<User> {
    const [users]: [User[], number] = await this.userRepository.findOpenQuery({
      where: { email: userInfo.email },
    });
    if (users[0]) {
      throw new UserDuplicatedException(DULICATED_EXCEPTION_MESSAGE);
    }
    const userPayload: User = await this.userRepository.createOne(userInfo);
    const profile: Profile = await this.profileRepository.createOne();
    userPayload.profile = profile;
    await this.userRepository.saveOneByEntity(userPayload);
    return userPayload;
  }

  async deleteUser(id: string): Promise<User> {
    const user: User = await this.userRepository.findOneByIdOrThrow(id);
    return await this.userRepository.deleteOneByEntity(user);
  }
  // --------------------------------------------------------------------
  mergeUserEntity(user: User, updateUserDto: UpdateUserDto): User {
    return this.userRepository.mergeEntity(user, updateUserDto);
  }

  async saveUser(user: User): Promise<User> {
    return await this.userRepository.saveOneByEntity(user);
  }

  async getAllUsersByAdmin(skip?: number, take?: number): Promise<[User[], number]> {
    return await this.userRepository.findAll(skip, take);
  }

  async getUsersByIdsByAdmin(ids: string[], skip?: number, take?: number): Promise<[User[], number]> {
    return await this.userRepository.findAllByIds(ids, skip, take);
  }

  async getUsersByEmailsByAdmin(emails: string[]): Promise<[User[], number]> {
    return await this.userRepository.findOpenQuery({
      where: { email: In(emails) },
    });
  }

  async getUserWithRelationByAdmin(id: string): Promise<User> {
    await this.userRepository.findOneByIdOrThrow(id);
    const [users]: [User[], number] = await this.userRepository.findOpenQuery({
      relations: { profile: true },
      where: { id },
    });
    return users[0];
  }

  async deleteUsersByIdsByAdmin(ids: string[]): Promise<User[]> {
    const [users]: [User[], number] = await this.userRepository.findAllByIds(ids);
    return await this.userRepository.deleteManyByEntities(users);
  }

  async updateUserRoleByAdmin(id: string, role: Role.Admin_0 | Role.Admin_1 | Role.Admin_2): Promise<User> {
    await this.userRepository.findOneByIdOrThrow(id);
    await this.userRepository.updateOne(id, { role });
    return await this.userRepository.findOneByIdOrThrow(id);
  }
}
