import { JwtStrategy } from "@app/common/strategies/jwt.strategy";
import { LocalStrategy } from "@app/common/strategies/local.strategy";

export default [JwtStrategy, LocalStrategy];
