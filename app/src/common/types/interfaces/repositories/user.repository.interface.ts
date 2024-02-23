import { BaseInterfaceRepository } from "@app/common/repository/base.interface.repository";
import { User } from "@app/entities/user.entity";

export interface UserRepositoryIntrface extends BaseInterfaceRepository<User> {}
