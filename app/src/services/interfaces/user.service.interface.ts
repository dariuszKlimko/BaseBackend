import { CreateUserDto } from "@app/dtos/user/create.user.dto";
import { User } from "@app/entities/user.entity";

export interface UserServiceIntrface {
    getUser(id: string): Promise<User>;
    registerUser(userInfo: CreateUserDto): Promise<User>;
    deleteUser(id: string): Promise<User>;
}
