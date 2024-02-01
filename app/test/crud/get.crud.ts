import { INestApplication } from "@nestjs/common";
import * as request from "supertest";

export async function getCRUD(
  path: string,
  accessToken: string,
  app: INestApplication,
): Promise<request.Response> {
  return request
    .default(app.getHttpServer())
    .get(path)
    .set("Authorization", `Bearer ${accessToken}`)
    .then((res) => res);
}