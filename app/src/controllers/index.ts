import { AuthController } from "@app/controllers/auth.controller";
import { MeasurementsController } from "@app/controllers/measurements.controller";
import { ProfilessController } from "@app/controllers/profile.controller";
import { UsersController } from "@app/controllers/users.controller";

export default [
    UsersController,
    ProfilessController,
    MeasurementsController,
    AuthController,
];