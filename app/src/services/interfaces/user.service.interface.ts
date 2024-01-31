import { Role } from "@app/common/types/role.enum";
import { VerificationCode } from "@app/common/types/verificationCode";
import { CreateUserByAdminDto } from "@app/dtos/user/create.user.by.admin.dto";
import { CreateUserDto } from "@app/dtos/user/create.user.dto";
import { UpdateUserDto } from "@app/dtos/user/update.user.dto";
import { User } from "@app/entities/user.entity";
import { FindManyOptions, FindOptionsWhere, UpdateResult } from "typeorm";

export interface UserServiceIntrface {
  mergeEntity(user: User, updateUserDto: UpdateUserDto): User;
  findOneByIdOrThrow(id: string): Promise<User>;
  saveOneByEntity(user: User): Promise<User>;
  findAll(skip?: number, take?: number): Promise<[User[], number]>;
  findAllByIds(ids: string[], skip?: number, take?: number): Promise<[User[], number]>;
  deleteOneByEntity(user: User): Promise<User>;
  findOpenQuery(query: FindManyOptions<User>): Promise<[User[], number]>;
  deleteManyByEntities(users: User[]): Promise<User[]>;
  createOne(userInfo?: CreateUserDto): Promise<User>;
  findOneByConditionOrThrow(condition: FindOptionsWhere<User> | FindOptionsWhere<User>[]): Promise<User>;
  // updateOne(id: string, userInfo: UpdateUserDto): Promise<UpdateResult>;
  // --------------------------------------------------------
  updateVerificationCode(id: string, userPayload: VerificationCode): Promise<UpdateResult>;
  updateRoleByAdmin(id: string, role: Role.Admin_1 | Role.Admin_2): Promise<UpdateResult>;
  _checkIfUserExist(user: User): void;
  registerUser(userInfo: CreateUserDto | CreateUserByAdminDto): Promise<User>;
}
