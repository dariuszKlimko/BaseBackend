import { DataSource, DataSourceOptions } from "typeorm";
import { config } from "dotenv";
import path from "path";
import { IDataSource } from "@app/modules/database/types/dataSourceOptions";

const root = path.resolve(__dirname, "../../../");
const envpath = path.resolve(root, "../");
config({ path: `${envpath}/.env` });

export const dataSourceFunc = (env: string): DataSourceOptions => {
  const dataSourceOptionsProd: DataSourceOptions = {
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: ["migration", "error"],
    entities: [path.join(root, "dist/modules/**/*.entity{.js,.ts}")],
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
    entities: [path.join(root, "src/modules/**/*.entity{.js,.ts}")],
    migrations: [path.join(root, "src/migrations/*.ts")],
  };

  const options: IDataSource = {
    production: dataSourceOptionsProd,
    development: dataSourceOptionsDev,
    test: dataSourceOptionsTest,
  };

  return options[env];
};

const dataSource = new DataSource(dataSourceFunc(process.env.NODE_ENV));

export default dataSource;
