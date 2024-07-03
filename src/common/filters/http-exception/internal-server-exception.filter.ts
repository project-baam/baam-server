import {
  ArgumentsHost,
  Catch,
  HttpStatus,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import { ErrorCode } from './../../constants/error-codes';

// 핸들링 되지 않은 서버 에러
@Catch()
export class InternalServerErrorFilter extends BaseExceptionFilter {
  catch(exception: InternalServerErrorException, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();

    // TODO: 에러 리포팅

    // Error Log
    Logger.error(exception.message);
    Logger.error(exception.stack);

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      code: ErrorCode.InternalServerError,
      message: `Oops! There was a problem with our server. We're working to fix it as soon as possible.`,
    });
  }
}
