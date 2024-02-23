import { MessageInfo } from "@app/dtos/auth/message.info.response";
import { ResetPasswordDto } from "@app/dtos/auth/password.reset.dto";
import { UpdateCredentialsDto } from "@app/dtos/auth/update.creadentials.dto";
import { CreateUserDto } from "@app/dtos/user/create.user.dto";
import { User } from "@app/entities/user.entity";

export interface AuthServiceIntrface {
  userConfirmation(email: string): Promise<MessageInfo>;
  comparePassword(userInfo: CreateUserDto): Promise<User>;
  resetPasswordConfirm(resetPassord: ResetPasswordDto): Promise<MessageInfo>;
  updateCredentials(id: string, userInfo: UpdateCredentialsDto): Promise<User>;
}
