export enum ErrorCode {
  // 400
  InvalidParameter = 4000,

  // 401
  MissingAuthToken = 4010,
  InvalidAccessToken = 4011,
  InvalidRefreshToken = 4012,
  IncorrectLoginInfo = 4013,

  // 404
  ContentNotFound = 4040,

  // 409
  DuplicateValue = 4090,

  // 500
  InternalServerError = 5000,
}
