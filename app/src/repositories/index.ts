import { MeasurementRepository } from "@app/repositories/measurement.repository";
import { ProfileRepository } from "@app/repositories/profile.repository";
import { UserRepository } from "@app/repositories/user.repository";

export default [
    UserRepository, 
    ProfileRepository, 
    MeasurementRepository,
];