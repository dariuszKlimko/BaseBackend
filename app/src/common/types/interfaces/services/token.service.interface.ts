import { LogoutResponse } from "@app/dtos/auth/logout.response";
import { User } from "@app/entities/user.entity";
import { JwtPayload } from "jwt-decode";

export interface TokenServiceIntrface {
  decodeConfirmationToken(confirmationToken: string): Promise<string>;
  findUserByRefreshToken(refreshToken: string): Promise<User>;
  deleteRefreshTokenFromUser(user: User, refreshToken: string): Promise<void>;
  deleteAllRefreshTokensFromUser(id: string): Promise<LogoutResponse>;
  saveRefreshTokenToUser(user: User, refreshToken: string): Promise<string>;
  decodeJWTtoken(accessToken: string): JwtPayload;
}