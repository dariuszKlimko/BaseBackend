import { INestApplication } from "@nestjs/common";
import * as request from "supertest";

export async function userRegister(
  email: string,
  password: string,
  app: INestApplication
): Promise<request.Response> {
  return request
    .default(app.getHttpServer())
    .post("/users")
    .send({ email, password })
    .then((res) => res);
}
