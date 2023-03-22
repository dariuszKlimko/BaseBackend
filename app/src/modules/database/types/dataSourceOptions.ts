import { DataSourceOptions } from "typeorm";

export type IDataSource = {
  [key: string]: DataSourceOptions;
};
