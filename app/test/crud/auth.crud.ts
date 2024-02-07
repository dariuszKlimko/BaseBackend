import { INestApplication } from "@nestjs/common";
import { BodyCRUD } from "@test/helpers/types/body";
import * as request from "supertest";

export async function postAuthCRUD(
  path: string,
  accessToken: string,
  body: BodyCRUD | string[] | number[] | boolean[],
  app: INestApplication
): Promise<request.Response> {
  return request
    .default(app.getHttpServer())
    .post(path)
    .send(body)
    .set("Authorization", `Bearer ${accessToken}`)
    .then((res) => res);
}

export async function getAuthCRUD(
  path: string,
  accessToken: string,
  app: INestApplication
): Promise<request.Response> {
  return request
    .default(app.getHttpServer())
    .get(path)
    .set("Authorization", `Bearer ${accessToken}`)
    .then((res) => res);
}

export async function patchAuthCRUD(
  path: string,
  accessToken: string,
  body: BodyCRUD | string[] | number[] | boolean[] | null,
  app: INestApplication
): Promise<request.Response> {
  return request
    .default(app.getHttpServer())
    .patch(path)
    .send(body)
    .set("Authorization", `Bearer ${accessToken}`)
    .then((res) => res);
}

export async function deleteAuthCRUD(
  path: string,
  accessToken: string,
  app: INestApplication
): Promise<request.Response> {
  return request
    .default(app.getHttpServer())
    .delete(path)
    .set("Authorization", `Bearer ${accessToken}`)
    .then((res) => res);
}
