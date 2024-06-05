import { AuthService } from "@app/services/auth.service";
import { EmailService } from "@app/services/email.service";
import { GeneratorSevice } from "@app/services/generator.service";
import { MeasurementService } from "@app/services/measurement.service";
import { ProfileService } from "@app/services/profile.service";
import { TokenService } from "@app/services/token.service";
import { UserService } from "@app/services/user.service";
import { MathSevice } from "@app/services/math.service";
import { GoogleOAuthService } from "./google.oauth.service";

export default [
  UserService,
  TokenService,
  ProfileService,
  MeasurementService,
  GeneratorSevice,
  EmailService,
  AuthService,
  MathSevice,
  GoogleOAuthService,
];
