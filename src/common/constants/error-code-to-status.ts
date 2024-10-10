import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from './error-codes';

export const CodeToStatus: {
  [key in ErrorCode]: HttpStatus;
} = {
  [ErrorCode.NotificationAlreadyRead]: HttpStatus.NOT_MODIFIED,
  [ErrorCode.InvalidParameter]: HttpStatus.BAD_REQUEST,
  [ErrorCode.InvalidFileNameExtension]: HttpStatus.BAD_REQUEST,
  [ErrorCode.InvalidFilenameCharacters]: HttpStatus.BAD_REQUEST,
  [ErrorCode.MissingRequiredFields]: HttpStatus.BAD_REQUEST,
  [ErrorCode.InvalidProfileImageField]: HttpStatus.BAD_REQUEST,
  [ErrorCode.InvalidFileSize]: HttpStatus.BAD_REQUEST,
  [ErrorCode.UnexpectedFields]: HttpStatus.BAD_REQUEST,
  [ErrorCode.MalformedDevicePushToken]: HttpStatus.BAD_REQUEST,
  [ErrorCode.UserNotOnlineInRoom]: HttpStatus.BAD_REQUEST,
  [ErrorCode.MissingAuthToken]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.InvalidAccessToken]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.InvalidRefreshToken]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.IncorrectLoginInfo]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.ChatUnAuthenticated]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.ContentNotFound]: HttpStatus.NOT_FOUND,
  [ErrorCode.DuplicateValue]: HttpStatus.CONFLICT,
  [ErrorCode.SelfFriendRequest]: HttpStatus.CONFLICT,
  [ErrorCode.AlreadyFriends]: HttpStatus.CONFLICT,
  [ErrorCode.DuplicateFriendRequest]: HttpStatus.CONFLICT,
  [ErrorCode.SchoolTimeNotSet]: HttpStatus.CONFLICT,
  [ErrorCode.InternalServerError]: HttpStatus.INTERNAL_SERVER_ERROR,
  [ErrorCode.NeisError]: HttpStatus.INTERNAL_SERVER_ERROR,
  [ErrorCode.SocialAuthenticationFailed]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.IncompleteProfile]: HttpStatus.FORBIDDEN,
  [ErrorCode.UnauthorizedSubjectAccess]: HttpStatus.FORBIDDEN,
} as const;
