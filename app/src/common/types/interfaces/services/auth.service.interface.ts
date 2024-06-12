import { MessageInfo } from "@app/dtos/auth/message.info.response";
import { ResetPasswordDto } from "@app/dtos/auth/password.reset.dto";
import { UpdatePasswordDto } from "@app/dtos/auth/update.password.dto";
import { CreateUserDto } from "@app/dtos/user/create.user.dto";
import { User } from "@app/entities/user.entity";
import { UserAuth } from "../../type/userAuth";

export interface AuthServiceIntrface {
  userConfirmation(email: string): Promise<MessageInfo>;
  comparePassword(userInfo: CreateUserDto): Promise<User>;
  resetPasswordConfirm(resetPassord: ResetPasswordDto): Promise<MessageInfo>;
  updatePassword(id: string, userInfo: UpdatePasswordDto): Promise<User>;
  checkIfNotExternalProvider(id: string): Promise<User>;
  googleOauth(userAuth: UserAuth): Promise<User>
}
