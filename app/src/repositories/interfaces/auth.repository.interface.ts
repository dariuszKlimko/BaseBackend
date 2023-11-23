import { BaseInterfaceRepository } from "@app/common/repository/base.interface.repository";
import { LoginDto } from "@app/dtos/auth/login.dto";
import { TokenDto } from "@app/dtos/auth/token.dto";
import { User } from "@app/entities/user.entity";

export interface AuthRepositoryInterface extends BaseInterfaceRepository<User, LoginDto, TokenDto> {}