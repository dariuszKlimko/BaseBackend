import { OAuthAbstractService } from "@app/common/services/oauth.abstract.service";
import { GoogleOAuthIntrface } from "@app/common/types/interfaces/services/google.oauth.service.interface";
import { Injectable} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GoogleOAuthService extends OAuthAbstractService implements GoogleOAuthIntrface{
    constructor(
      configService: ConfigService,
    ) {
      super(
        configService.get("GOOGLE_OAUTH_URL_CODE"),
        configService.get("GOOGLE_OAUTH_URL_TOKEN"), 
        configService.get("GOOGLE_OAUTH_REDIRECT"),
        configService.get("GOOGLE_OAUTH_GRANDTYPE"),
        configService.get("GOOGLE_OAUTH_CLIENT_ID"),
        configService.get("GOOGLE_OAUTH_CLIENT_SECRET"),
      );
    }
}
