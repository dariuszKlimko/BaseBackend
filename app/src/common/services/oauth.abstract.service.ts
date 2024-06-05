import { Injectable } from "@nestjs/common";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { OAuthInterfaceService } from "./oauth.interface.service";
import { ExchangeCodeForTokenBody } from "../types/type/exchangeCodeForTokenBody";

@Injectable()
export abstract class OAuthAbstractService implements OAuthInterfaceService {
  private readonly urlCode: string;
  private readonly urlToken: string;
  private readonly redirectUri: string;
  private readonly grantType: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(urlCode: string, urlToken: string, redirectUri: string, grantType: string, clientId: string, clientSecret: string) {
    this.urlCode = urlCode;
    this.urlToken = urlToken;
    this.redirectUri = redirectUri;
    this.grantType = grantType;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  async exchangeCodeForToken(code: string): Promise<AxiosResponse> {
    const body: ExchangeCodeForTokenBody = {
      redirect_uri: this.redirectUri,
      code,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: this.grantType,
    };
    
    try {
      const result: AxiosResponse = await axios.post(this.urlCode, body);
      return result;
    } catch (error) {
      throw new Error(error);
    }
  }

  async exchangeTokenForUserInfo(token: string): Promise<AxiosResponse> {
    const config: AxiosRequestConfig = {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    };

    try {
      const result: AxiosResponse = await axios.get(this.urlToken, config);
      return result;
    } catch (error) {
      throw new Error(error);
    }
  }
}