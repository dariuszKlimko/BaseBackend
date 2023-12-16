import { BaseAbstractRepository } from "@app/common/repository/base.abstract.repository";
import { User } from "@app/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserRepositoryIntrface } from "@app/repositories/interfaces/user.repository.interface";
import { USER_NOT_FOUND } from "@app/common/constans/constans";

export class UserRepository extends BaseAbstractRepository<User> implements UserRepositoryIntrface {
  constructor(@InjectRepository(User) userRepository: Repository<User>) {
    super(userRepository, USER_NOT_FOUND);
  }
}
