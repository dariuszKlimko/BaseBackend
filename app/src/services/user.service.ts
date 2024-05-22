import { Injectable, Logger } from "@nestjs/common";
import { User } from "@app/entities/user.entity";
import { CreateUserDto } from "@app/dtos/user/create.user.dto";
import { UserDuplicatedException } from "@app/common/exceptions/user.duplicated.exception";
import { UserRepository } from "@app/repositories/user.repository";
import { UserRepositoryIntrface } from "@app/common/types/interfaces/repositories/user.repository.interface";
import { DULICATED_EXCEPTION_MESSAGE } from "@app/common/constans/exceptions.constans";
import { UserServiceIntrface } from "@app/common/types/interfaces/services/user.service.interface";
import { UpdateResult } from "typeorm";
import { VerificationCode } from "@app/common/types/type/verificationCode";
import { CreateUserByAdminDto } from "@app/dtos/user/create.user.by.admin.dto";
import { Profile } from "@app/entities/profile.entity";
import { Role } from "@app/common/types/enum/role.enum";
import { BaseAbstractService } from "@app/common/services/base.abstract.service";
import { ProfileServiceIntrface } from "@app/common/types/interfaces/services/profile.service.interface";
import { ProfileService } from "@app/services/profile.service";

@Injectable()
export class UserService extends BaseAbstractService<User> implements UserServiceIntrface {
  private readonly logger: Logger = new Logger(UserService.name);
  private readonly userRepository: UserRepositoryIntrface;
  private readonly profileService: ProfileServiceIntrface;

  constructor(userRepository: UserRepository, profileService: ProfileService) {
    super(userRepository);
    this.userRepository = userRepository;
    this.profileService = profileService;
  }

  async updateVerificationCode(id: string, userPayload: VerificationCode): Promise<UpdateResult> {
    return await this.userRepository.updateOne(id, userPayload);
  }

  async updateRole(id: string, role: Role.Admin_1 | Role.Admin_2): Promise<UpdateResult> {
    return await this.userRepository.updateOne(id, { role });
  }

  async registerUser(userInfo: CreateUserDto | CreateUserByAdminDto): Promise<User> {
    const [users]: [User[], number] = await this.findOpenQuery({
      where: { email: userInfo.email },
    });
    if (users[0]) {
      throw new UserDuplicatedException(DULICATED_EXCEPTION_MESSAGE);
    }
    const userPayload: User = await this.createOne(userInfo);
    const profile: Profile = await this.profileService.createOne();
    userPayload.profile = profile;
    await this.saveOneByEntity(userPayload);
    return userPayload;
  }
}
