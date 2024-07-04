import { HttpStatus } from '@nestjs/common';
import { CodeToStatus } from 'src/common/constants/error-code-to-status';
import { ErrorCode } from 'src/common/constants/error-codes';

export class ApplicationException extends Error {
  code: ErrorCode;

  constructor(code?: ErrorCode, err?: string | Error) {
    super();
    this.code = code || ErrorCode.InternalServerError;

    if (typeof err === 'string') {
      this.message = err;
    }

    if (typeof err === 'object') {
      this.name = err.name;
      this.message = err.message;
      this.stack = err.stack;
    }
  }

  getStatus(): HttpStatus {
    return CodeToStatus[this.code];
  }
}
