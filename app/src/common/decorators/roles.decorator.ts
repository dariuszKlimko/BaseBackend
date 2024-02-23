import { CustomDecorator, SetMetadata } from "@nestjs/common";
import { Role } from "@app/common/types/enum/role.enum";

export const Roles = (...roles: Role[]): CustomDecorator<string> => {
  return SetMetadata("roles", roles);
};
