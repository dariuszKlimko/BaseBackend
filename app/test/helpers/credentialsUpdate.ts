import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { Credentials } from "@test/helpers/types/credentials";


export async function credentialsUpdate(
  accessToken: string,
  dataToUpdate: Credentials,
  app: INestApplication
): Promise<request.Response> {
  return request
    .default(app.getHttpServer())
    .patch("/auth/credentials")
    .set("Authorization", `Bearer ${accessToken}`)
    .send(dataToUpdate)
    .then((res) => res);
}
