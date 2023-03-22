import { Module } from "@nestjs/common";
import { UsersController } from "@app/modules/user/users.controller";
import { UsersService } from "@app/modules/user/user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "@app/modules/user/entities/user.entity";
import { EmailModule } from "@app/modules/email/email.module";

@Module({
  imports: [TypeOrmModule.forFeature([User]), EmailModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UserModule {}
