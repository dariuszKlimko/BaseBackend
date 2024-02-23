import { INestApplication } from "@nestjs/common";
import { BodyCRUD } from "@test/helpers/types/body";
import * as request from "supertest";

export async function postAuthCRUD(
  path: string,
  accessToken: string,
  body: BodyCRUD | null,
  app: INestApplication,
  cookie: string = null
): Promise<request.Response> {
  return request
    .default(app.getHttpServer())
    .post(path)
    .send(body)
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Cookie", cookie)
    .then((res) => res);
}

export async function getAuthCRUD(
  path: string,
  accessToken: string,
  body: BodyCRUD | null,
  app: INestApplication,
  cookie: string = null
): Promise<request.Response> {
  return request
    .default(app.getHttpServer())
    .get(path)
    .send(body)
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Cookie", cookie)
    .then((res) => res);
}

export async function patchAuthCRUD(
  path: string,
  accessToken: string,
  body: BodyCRUD | null,
  app: INestApplication,
  cookie: string = null
): Promise<request.Response> {
  return request
    .default(app.getHttpServer())
    .patch(path)
    .send(body)
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Cookie", cookie)
    .then((res) => res);
}

export async function deleteAuthCRUD(
  path: string,
  accessToken: string,
  body: BodyCRUD | null,
  app: INestApplication,
  cookie: string = null
): Promise<request.Response> {
  return request
    .default(app.getHttpServer())
    .delete(path)
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Cookie", cookie)
    .send(body)
    .then((res) => res);
}
