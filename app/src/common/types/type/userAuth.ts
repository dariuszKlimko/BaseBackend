import { ExternalProvider } from "../enum/external.provider.enum";

export type UserAuth = {
  email: string;
  verified: boolean;
  provider: ExternalProvider.GOOGLE | ExternalProvider.FACEBOOK | ExternalProvider.X;
}