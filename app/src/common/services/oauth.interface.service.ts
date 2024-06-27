import { AxiosResponse } from "axios";

export interface OAuthInterfaceService {
    exchangeCodeForToken(code: string): Promise<AxiosResponse>
    exchangeTokenForUserInfo(token: string): Promise<AxiosResponse>;
  }