import { CustomDecorator, SetMetadata } from "@nestjs/common";
import { Role } from "@app/common/constans/role.enum";

export const Roles = (...roles: Role[]): CustomDecorator<string> => SetMetadata("roles", roles);