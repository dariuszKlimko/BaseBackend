import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "@app/modules/user/entities/user.entity";
import { CreateUserDto } from "@app/modules/user/dto/create-user.dto";
import { UserDuplicateException } from "@app/modules/user/exceptions/userDuplicate.exception";
import { UpdateUserDto } from "@app/modules/user/dto/update-user.dto";
import { UserNotFoundException } from "@app/common/exceptions/userNotFound.exception";

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  async registerUser(userInfo: CreateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ email: userInfo.email });
    if (user) {
      throw new UserDuplicateException("user with given email address aldeady exist in database");
    }
    const userPayload = this.userRepository.create(userInfo);
    await this.userRepository.save(userPayload);
    return userPayload;
  }

  async getUser(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    return user;
  }

  async updateUser(id: string, userInfo: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, userInfo);
    const user = await this.userRepository.findOneBy({ id });
    return user;
  }

  async deleteUser(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    await this.userRepository.delete(id);
    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new UserNotFoundException("user with given email address not exist in database");
    }
    return user;
  }
}
