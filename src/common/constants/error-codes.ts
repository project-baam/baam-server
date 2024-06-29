export enum ErrorCode {
  // 400
  InvalidParameter = 'INVALID_PARAMETER',

  // 401
  MissingAuthToken = 'MISSING_AUTHENTICATION_TOKEN',
  InvalidAccessToken = 'INVALID_ACCESS_TOKEN',
  InvalidRefreshToken = 'INVALID_REFRESH_TOKEN',
  IncorrectLoginInfo = 'INCORRECT_LOGIN_INFO',

  // 404
  ContentNotFound = 'CONTENT_NOT_FOUND',

  // 409
  DuplicateValue = 'DUPLICATE_VALUE',

  // 500
  InternalServerError = 'SERVER_ERROR',
}
