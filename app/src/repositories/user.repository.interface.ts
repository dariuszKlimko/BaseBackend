import { BaseInterfaceRepository } from "@app/common/repository/base.interface.repository";
import { CreateUserDto } from "@app/dtos/user/create-user.dto";
import { User } from "@app/entities/user.entity";

export interface UserRepositoryInterface extends BaseInterfaceRepository<User, CreateUserDto, null> {

}