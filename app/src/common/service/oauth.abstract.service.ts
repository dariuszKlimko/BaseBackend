import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { AxiosError, AxiosRequestConfig } from "axios";
import { catchError, firstValueFrom, lastValueFrom, map } from "rxjs";
import { AxiosException } from "@app/common/exceptions/auth/axion.exception";

@Injectable()
export abstract class OAuthAbstractService {
    private readonly httpService: HttpService;

    constructor(httpService: HttpService) {
        this.httpService = httpService;
    }

    async exchangeCodeForToken(url: string, redirectUri: string, grantType: string, clientId: string, code: string): Promise<any> {
        const data = {
            redirect_uri: redirectUri,
            grant_type: grantType,
            code: code,
            client_id: clientId
        };

        const requestConfig: AxiosRequestConfig = {
            headers: {
              'Content-Type': 'Application/X-Www-Form-Urlencoded',
            },
        };
          
        const response: any = await lastValueFrom(
            this.httpService.post<any>(url, data, requestConfig).pipe(
                map((res) => {
                    return res.data;
                }),
                catchError((error: AxiosError) => {
                    // Error handeling to be done
                    console.log("LOGGER____axiosError: ", error)
                    throw new AxiosException(error.message);
                }),
            )
        );
        return response;
    }

    async exchangeTokenForUserInfo(url: string, redirectUri: string, token: string): Promise<any> {
        // const response: any = await lastValueFrom(
        //     this.httpService.post<any>(url, data, requestConfig).pipe(
        //         map((res) => {
        //             return res.data;
        //         }),
        //         catchError((error: AxiosError) => {
        //             // Error handeling to be done
        //             console.log("LOGGER____axiosError: ", error)
        //             throw new AxiosException(error.message);
        //         }),
        //     )
        // );
        // return response;
    }




    // const requestConfig: AxiosRequestConfig = {
    //     headers: {
    //       'Content-Type': 'YOUR_CONTENT_TYPE_HEADER',
    //     },
    //     params: {
    //       param1: 'YOUR_VALUE_HERE'
    //     },
    //   };
      
    //   const responseData = await lastValueFrom(
    //     this.httpService.post(requestUrl, null, requestConfig).pipe(
    //       map((response) => {
    //         return response.data;
    //       }),
    //     ),
    //   );




    // async exchangeCodeForToken(url: string, redirectUri: string, grantType: string, clientId: string, code: string): Promise<any> {
    //     // POST /oauth2/v4/token HTTP/1.1
    //     // Host: www.googleapis.com
    //     // Content-length: 233
    //     // content-type: application/x-www-form-urlencoded
    //     // user-agent: google-oauth-playground
    //     // code=4%2FKxoYTS-jeq5-d6Lv7YvSz9ZrK0pJ_5lZsMExzNC1M0o&
    //     // redirect_uri=https%3A%2F%2Fdevelopers.google.com%2Foauthplayground&
    //     // client_id=407408718192.apps.googleusercontent.com&c
    //     // lient_secret=************&
    //     // scope=&
    //     // grant_type=authorization_code
        
    //     const data = {
    //         redirect_uri: redirectUri,
    //         grant_type: grantType,
    //         code: code,
    //         client_id: clientId
    //     }
    //     const options = {
    //         headers: {
    //             'Content-Type': 'Application/X-Www-Form-Urlencoded'
    //         }
    //     };
    //     const result = await axios.post(url, data, options);
    //     console.log("LOGGER___oauth: ", result);

    // }
}