import { BaseAbstractRepository } from "@app/common/repository/base.abstract.repository";
import { CreateUserDto } from "@app/dtos/user/create-user.dto";
import { UpdateUserDto } from "@app/dtos/user/update-user.dto";
import { User } from "@app/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserRepositoryIntrface } from "./interfaces/user.repository.interface";

export class UserRepository extends BaseAbstractRepository<User, CreateUserDto, UpdateUserDto> implements UserRepositoryIntrface {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {
        super(userRepository, "dddd");
    }
}