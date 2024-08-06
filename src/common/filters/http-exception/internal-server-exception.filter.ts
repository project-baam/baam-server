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
import { ReportProvider } from 'src/common/provider/report.provider';

// 핸들링 되지 않은 서버 에러
@Catch()
export class InternalServerErrorFilter extends BaseExceptionFilter {
  catch(exception: InternalServerErrorException, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();

    const { method, body, query, params, url, headers, _startTime } =
      http.getRequest();

    ReportProvider.report(exception, {
      method,
      body,
      query,
      params,
      url,
      headers,
      startTime: _startTime,
    });

    // Error Log
    Logger.error(exception.message);
    Logger.error(exception.stack);

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      code: ErrorCode.InternalServerError,
      message: `Oops! There was a problem with our server. We're working to fix it as soon as possible.`,
    });
  }
}
