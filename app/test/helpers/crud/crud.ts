import { INestApplication } from "@nestjs/common";
import { BodyCRUD } from "@test/helpers/types/body";
import * as request from "supertest";

export async function postCRUD(
  path: string,
  body: BodyCRUD | string[] | number[] | boolean[],
  app: INestApplication
): Promise<request.Response> {
  return request
    .default(app.getHttpServer())
    .post(path)
    .send(body)
    .then((res) => res);
}

export async function getCRUD(path: string, app: INestApplication): Promise<request.Response> {
  return request
    .default(app.getHttpServer())
    .get(path)
    .then((res) => res);
}

export async function patchCRUD(
  path: string,
  body: BodyCRUD | string[] | number[] | boolean[] | null,
  app: INestApplication
): Promise<request.Response> {
  return request
    .default(app.getHttpServer())
    .patch(path)
    .send(body)
    .then((res) => res);
}

export async function deleteCRUD(path: string, app: INestApplication): Promise<request.Response> {
  return request
    .default(app.getHttpServer())
    .delete(path)
    .then((res) => res);
}