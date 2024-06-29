import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { ApplicationException } from 'src/common/types/error/application-exceptions';

@Catch(ApplicationException)
export class HttpExceptionFilter<T extends ApplicationException>
  implements ExceptionFilter
{
  catch(exception: T, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    response.status(exception.getStatus()).json({
      result: false,
      code: exception.code,
      message: exception.message,
    });
  }
}
