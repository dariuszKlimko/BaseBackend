import { User } from "@app/entities/user.entity";
import { JwtPayload } from "jwt-decode";

export interface TokenServiceIntrface {
  decodeConfirmationToken(confirmationToken: string): Promise<string>;
  findUserByRefreshToken(refreshToken: string): Promise<User>;
  saveRefreshTokenToDB(user: User, refreshToken: string): Promise<string>;
  decodeJWTtoken(accessToken: string): JwtPayload;
}
