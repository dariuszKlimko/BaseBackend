import { INestApplication } from "@nestjs/common";
import * as request from "supertest";

export async function userLogin(
  email: string,
  password: string,
  app: INestApplication
): Promise<request.Response> {
  return request
    .default(app.getHttpServer())
    .post("/auth/login")
    .send({ email, password })
    .then((res) => res);
}
