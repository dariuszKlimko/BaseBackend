import { AxiosResponse } from "axios";
import { OauthUserInfoBody } from "../types/type/oauthUserInfoBody";

export interface OAuthInterfaceService {
    exchangeCodeForToken(code: string): Promise<AxiosResponse>
    exchangeTokenForUserInfo(token: string): Promise<AxiosResponse>;
  }