export type ExchangeCodeForTokenBody = {
  redirect_uri: string;
  code: string;
  client_id: string;
  client_secret: string;
  grant_type: string;
};
