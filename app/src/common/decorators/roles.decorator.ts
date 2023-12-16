import { CustomDecorator, SetMetadata } from "@nestjs/common";
import { Role } from "@app/common/types/role.enum";

export const Roles = (...roles: Role[]): CustomDecorator<string> => {
  return SetMetadata("roles", roles);
};
