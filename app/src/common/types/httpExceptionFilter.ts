// export enum EErrorResponse {
//     code = "code",
//     timestamp = "timestamp",
//     path = "path",
//     method = "method",
//     message = "message",
// }

// export type ErrorResponse = {
//     [key in EErrorResponse]: string | number | null;
// };

export type ErrorResponse = {
  code: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
};
