import { BaseAbstractRepository } from "@app/common/repository/base.abstract.repository";
import { LoginDto } from "@app/dtos/auth/login.dto";
import { TokenDto } from "@app/dtos/auth/token.dto";
import { User } from "@app/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthRepositoryInterface } from "@app/repositories/interfaces/auth.repository.interface";

export class AuthRepository extends BaseAbstractRepository<User, LoginDto, TokenDto> implements AuthRepositoryInterface {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {
        super(userRepository, "dddd");
    }
}