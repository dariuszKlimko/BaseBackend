import { BaseInterfaceService } from "@app/common/service/base.interface.service";
import { Role } from "@app/common/types/role.enum";
import { VerificationCode } from "@app/common/types/verificationCode";
import { CreateUserByAdminDto } from "@app/dtos/user/create.user.by.admin.dto";
import { CreateUserDto } from "@app/dtos/user/create.user.dto";
import { User } from "@app/entities/user.entity";
import { UpdateResult } from "typeorm";

export interface UserServiceIntrface extends BaseInterfaceService<User> {
  updateVerificationCode(id: string, userPayload: VerificationCode): Promise<UpdateResult>;
  updateRoleByAdmin(id: string, role: Role.Admin_1 | Role.Admin_2): Promise<UpdateResult>;
  _checkIfUserExist(user: User): void;
  registerUser(userInfo: CreateUserDto | CreateUserByAdminDto): Promise<User>;
}
