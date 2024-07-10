import { ErrorCode } from 'src/common/constants/error-codes';
import { ApplicationException } from './application-exceptions.base';

export class ContentNotFoundError extends ApplicationException {
  constructor(resource: string = '$resource', id: string | number = '$id') {
    const message = `${resource} #${id} not found`;
    super(ErrorCode.ContentNotFound, message);
  }
}

export class DuplicateValueError extends ApplicationException {
  constructor(
    resource: string = '$resource',
    property: string = '$property',
    value: string | number = '$value',
  ) {
    const message = `Duplicate *${property}* for *${resource}*: *${value}*`;
    super(ErrorCode.DuplicateValue, message);
  }
}

export class MissingAuthTokenError extends ApplicationException {
  constructor() {
    super(
      ErrorCode.MissingAuthToken,
      'Access token is missing in the request header.',
    );
  }
}

export class InvalidAccessTokenError extends ApplicationException {
  constructor() {
    super(ErrorCode.InvalidAccessToken, 'Invalid Access Token');
  }
}

export class InvalidatedRefreshTokenError extends ApplicationException {
  constructor() {
    super(
      ErrorCode.InvalidRefreshToken,
      'Access denied. Your refresh token might have been stolen',
    );
  }
}

export class IncorrectLoginInfo extends ApplicationException {
  constructor() {
    super(
      ErrorCode.IncorrectLoginInfo,
      'The email address or password is incorrect',
    );
  }
}

export class NeisError extends ApplicationException {
  constructor(message?: string) {
    super(ErrorCode.NeisError, message);
  }
}
