import { AuthService } from "@app/services/auth.service";
import { EmailService } from "@app/services/email.service";
import { GeneratorSevice } from "@app/services/generator.service";
import { MeasurementsService } from "@app/services/measurements.service";
import { ProfilesService } from "@app/services/profile.service";
import { TokenService } from "@app/services/token.service";
import { UsersService } from "@app/services/user.service";

export default [
    UsersService, 
    TokenService, 
    ProfilesService, 
    MeasurementsService,
    GeneratorSevice,
    EmailService,
    AuthService,
];