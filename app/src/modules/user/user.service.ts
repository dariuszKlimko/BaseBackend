import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "@app/modules/user/entities/user.entity";
import { CreateUserDto } from "@app/modules/user/dto/create-user.dto";
import { UserDuplicateException } from "@app/modules/user/exceptions/userDuplicate.exception";
import { randomBytes } from "crypto";
import { UpdateUserDto } from "@app/modules/user/dto/update-user.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  async registerUser(userInfo: CreateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ email: userInfo.email });
    if (user) {
      throw new UserDuplicateException("user with given email address aldeady exist in database");
    }
    const code = randomBytes(8).toString("hex");
    const { email, password } = userInfo;
    const hashedPassword = await bcrypt.hash(password, 10);
    const userPayload = this.userRepository.create();
    userPayload.verificationCode = code;
    userPayload.password = hashedPassword;
    userPayload.email = email;
    await this.userRepository.save(userPayload);
    userPayload.password = null;
    userPayload.refreshTokens = null;
    return userPayload;
  }

  async getUser(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    user.password = null;
    user.refreshTokens = null;
    user.verificationCode = null;
    return user;
  }

  async updateUser(id: string, userInfo: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, userInfo);
    const user = await this.userRepository.findOneBy({ id });
    user.password = null;
    user.refreshTokens = null;
    user.verificationCode = null;
    return user;
  }

  async deleteUser(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    await this.userRepository.delete(id);
    user.password = null;
    user.refreshTokens = null;
    user.verificationCode = null;
    return user;
  }
}
