// export enum ELoggerDestructure {
//     ip = "ip",
//     method = "method",
//     originalUrl = "originalUrl",
//     statusCode = "statusCode",
// }

// export type LoggerDestructure = {
//     [key in ELoggerDestructure]?: string | number;
// };

export type LoggerDestructure = {
  ip: string;
  method: string;
  originalUrl: string;
  statusCode?: number;
};
