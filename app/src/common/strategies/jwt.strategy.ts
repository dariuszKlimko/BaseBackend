import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PayloadJwt } from "@app/common/types/payloadJwt";
import { UsersService } from "@app/services/user.service";
import { User } from "@app/entities/user.entity";
import { EntityNotFound } from "@app/common/exceptions/entityNotFound.exception";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly userService: UsersService;

  constructor(configService: ConfigService, userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET"),
    });
    this.userService = userService;
  }

  async validate(payload: PayloadJwt): Promise<boolean> {
    try {
      const user: User = await this.userService.getUser(payload.sub);
      return !!user;
    } catch (error) {
      if (error instanceof EntityNotFound) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }
}
