import { JwtService } from "@nestjs/jwt";

export function jwtGenerate(email: string, tokenSecret: string, tokenExpireTime: number, jwtService: JwtService) {
    const payload = { email };
    return jwtService.sign(payload, {
      secret: tokenSecret,
      expiresIn: `${tokenExpireTime}s`,
    });
}