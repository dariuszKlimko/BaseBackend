import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PayloadJwt } from "@app/common/types/auth/payloadJwt";
import { ValidateJwt } from "@app/common/types/auth/validateJwt";
import { UsersService } from "@app/services/user.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly userService: UsersService;

  constructor(
    configService: ConfigService,
    userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET"),
    });
    this.userService = userService;
  }

  async validate(payload: PayloadJwt): Promise<ValidateJwt> {
    await this.userService.getUser(payload.sub);
    return { id: payload.sub };
  }
}
