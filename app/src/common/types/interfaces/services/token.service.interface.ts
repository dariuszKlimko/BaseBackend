import { LogoutResponse } from "@app/dtos/auth/logout.response";
import { User } from "@app/entities/user.entity";
import { JwtPayload } from "@app/common/types/type/jwt.payload";

export interface TokenServiceIntrface {
  decodeConfirmationToken(confirmationToken: string): Promise<string>;
  findUserByRefreshToken(refreshToken: string): Promise<User>;
  deleteRefreshTokenFromUser(user: User, refreshToken: string): Promise<User>;
  deleteAllRefreshTokensFromUser(id: string): Promise<LogoutResponse>;
  saveRefreshTokenToUser(user: User, refreshToken: string): Promise<User>;
  verifyJWTtoken(accessToken: string): Promise<JwtPayload>;
}
