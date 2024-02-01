import { INestApplication } from "@nestjs/common";
import * as request from "supertest";

export async function patchCRUD(
  path: string,
  accessToken: string,
  body: request.Test,
  app: INestApplication,
): Promise<request.Response> {
  return request
    .default(app.getHttpServer())
    .patch(path)
    .send(body)
    .set("Authorization", `Bearer ${accessToken}`)
    .then((res) => res);
}