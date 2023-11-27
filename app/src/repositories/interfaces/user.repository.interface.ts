import { BaseInterfaceRepository } from "@app/common/repository/base.interface.repository";
import { CreateUserDto } from "@app/dtos/user/create-user.dto";
import { UpdateUserDto } from "@app/dtos/user/update-user.dto";
import { User } from "@app/entities/user.entity";

export interface UserRepositoryIntrface extends BaseInterfaceRepository<User, CreateUserDto, UpdateUserDto> {}
