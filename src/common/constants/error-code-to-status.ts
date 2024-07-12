import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from './error-codes';

export const CodeToStatus: {
  [key in ErrorCode]: HttpStatus;
} = {
  [ErrorCode.InvalidParameter]: HttpStatus.BAD_REQUEST,
  [ErrorCode.MissingAuthToken]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.InvalidAccessToken]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.InvalidRefreshToken]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.IncorrectLoginInfo]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.ContentNotFound]: HttpStatus.NOT_FOUND,
  [ErrorCode.DuplicateValue]: HttpStatus.CONFLICT,
  [ErrorCode.InternalServerError]: HttpStatus.INTERNAL_SERVER_ERROR,
  [ErrorCode.NeisError]: HttpStatus.INTERNAL_SERVER_ERROR,
} as const;
