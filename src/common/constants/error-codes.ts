export enum ErrorCode {
  // 400
  InvalidParameter = 4000,
  InvalidFileNameExtension = 4001,
  InvalidFilenameCharacters = 4002,
  MissingRequiredFields = 4003,

  // 401
  MissingAuthToken = 4010,
  InvalidAccessToken = 4011,
  InvalidRefreshToken = 4012,
  IncorrectLoginInfo = 4013,
  SocialAuthenticationFailed = 4014,

  // 403
  IncompleteProfile = 4030,

  // 404
  ContentNotFound = 4040,

  // 409
  DuplicateValue = 4090,

  // 500
  InternalServerError = 5000,
  NeisError = 5001,
}
