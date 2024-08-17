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
import { EnvironmentService } from 'src/config/environment/environment.service';

// 핸들링 되지 않은 서버 에러
@Catch()
export class InternalServerErrorFilter extends BaseExceptionFilter {
  constructor(private readonly environmentService: EnvironmentService) {
    super();
  }

  catch(exception: InternalServerErrorException, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();

    const { method, body, query, params, url, headers, _startTime } =
      http.getRequest();

    if (!this.environmentService.isLocal()) {
      ReportProvider.error(exception, {
        method,
        body,
        query,
        params,
        url,
        headers,
        _startTime,
      });
    }

    // Error Log
    Logger.error(exception.message);
    Logger.error(exception.stack);

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      code: ErrorCode.InternalServerError,
      message: `Oops! There was a problem with our server. We're working to fix it as soon as possible.`,
    });
  }
}
