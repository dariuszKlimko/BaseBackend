import { DataSource, DataSourceOptions } from "typeorm";
import { config } from "dotenv";
import path from "path";
import { IDataSource } from "@app/common/types/type/dataSourceOptions";
import { Logger } from "@nestjs/common";

const root: string = path.resolve(__dirname, "../");
const envpath: string = path.resolve(root, "../");
config({ path: `${envpath}/.env` });

export function dataBaseConfig(env: string): DataSourceOptions {
  const dataSourceOptionsProd: DataSourceOptions = {
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: ["migration", "error"],
    entities: [path.join(root, "dist/**/*.entity{.js,.ts}")],
    migrations: [path.join(root, "dist/migrations/*.js")],
  };

  const dataSourceOptionsDev: DataSourceOptions = {
    ...dataSourceOptionsProd,
    logging: ["query", "migration", "warn", "error"],
  };

  const dataSourceOptionsTest: DataSourceOptions = {
    ...dataSourceOptionsProd,
    database: `${process.env.DB_NAME}_test`,
    logging: ["migration", "warn", "error"],
    entities: [path.join(root, "src/**/*.entity{.js,.ts}")],
    migrations: [path.join(root, "src/migrations/*.ts")],
  };

  const options: IDataSource = {
    production: dataSourceOptionsProd,
    development: dataSourceOptionsDev,
    test: dataSourceOptionsTest,
  };

  return options[env];
}

const dataSource: DataSource = new DataSource(dataBaseConfig(process.env.NODE_ENV));

dataSource
  .initialize()
  .then(() => {
    Logger.log("Data Source has been initialized!");
  })
  .catch((err) => {
    Logger.error("Error during Data Source initialization", err);
  });

export default dataSource;
