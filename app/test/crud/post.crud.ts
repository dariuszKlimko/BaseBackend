import { INestApplication } from "@nestjs/common";
import * as request from "supertest";

export async function postCRUD(
  path: string,
  accessToken: string,
  body: request.Test,
  app: INestApplication,
): Promise<request.Response> {
  return request
    .default(app.getHttpServer())
    .post(path)
    .send(body)
    .set("Authorization", `Bearer ${accessToken}`)
    .then((res) => res);
}