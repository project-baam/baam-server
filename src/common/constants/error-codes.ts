export enum ErrorCode {
  // 304
  NotificationAlreadyRead = 3040,

  // 400
  InvalidParameter = 4000,
  InvalidFileNameExtension = 4001,
  InvalidFilenameCharacters = 4002,
  MissingRequiredFields = 4003,
  InvalidProfileImageField = 4004,
  UnexpectedFields = 4005,
  MalformedDevicePushToken = 4006,
  UserNotOnlineInRoom = 4007,
  InvalidFileSize = 4008,

  // 401
  MissingAuthToken = 4010,
  InvalidAccessToken = 4011,
  InvalidRefreshToken = 4012,
  IncorrectLoginInfo = 4013,
  SocialAuthenticationFailed = 4014,
  ChatUnAuthenticated = 4015,

  // 403
  IncompleteProfile = 4030,
  UnauthorizedSubjectAccess = 4031,

  // 404
  ContentNotFound = 4040,

  // 409
  DuplicateValue = 4090,
  AlreadyFriends = 4091,
  SelfFriendRequest = 4092,
  DuplicateFriendRequest = 4093,
  SchoolTimeNotSet = 4094,

  // 500
  InternalServerError = 5000,
  NeisError = 5001,
}
