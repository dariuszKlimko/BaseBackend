import { Role } from "@app/common/types/role.enum";
import { CreateUserDto } from "@app/dtos/user/create.user.dto";
import { UpdateUserDto } from "@app/dtos/user/update.user.dto";
import { User } from "@app/entities/user.entity";

export interface UserServiceIntrface {
  getUser(id: string): Promise<User>;
  registerUser(userInfo: CreateUserDto): Promise<User>;
  deleteUser(id: string): Promise<User>;
  // --------------------------------------------------------
  mergeUserEntity(user: User, updateUserDto: UpdateUserDto): User;
  saveUser(user: User): Promise<User>;
  getAllUsersByAdmin(skip?: number, take?: number): Promise<[User[], number]>;
  getUsersByIdsByAdmin(ids: string[], skip?: number, take?: number): Promise<[User[], number]>;
  getUsersByEmailsByAdmin(emails: string[], skip?: number, take?: number): Promise<[User[], number]>;
  getUserWithRelationByAdmin(id: string): Promise<User>;
  deleteUsersByIdsByAdmin(ids: string[]): Promise<User[]>;
  updateUserRoleByAdmin(id: string, role: Role.Admin_0 | Role.Admin_1 | Role.Admin_2): Promise<User>;
}
