import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { ErrorCode } from 'src/common/constants/error-codes';
import { EnvironmentService } from '../../../config/environment/environment.service';

// main.ts 에 ValidationPipe 에러를 BAD_REQUEST 로 정의함
@Catch(BadRequestException)
export class ParameterValidationExceptionFilter
  implements ExceptionFilter<BadRequestException>
{
  constructor(private readonly environmentService: EnvironmentService) {}
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const exceptionObj = exception.getResponse() as Record<string, any>;
    const isProduction = this.environmentService.isProduction();

    let errorMessages: string[] = [];

    if (Array.isArray(exceptionObj.message)) {
      errorMessages = exceptionObj.message.map((error: any) => {
        if (error.constraints) {
          // constraints 객체의 모든 메시지를 배열로 변환
          return Object.values(error.constraints).join('. ');
        }
        return error.toString();
      });
    } else if (typeof exceptionObj.message === 'string') {
      errorMessages = [exceptionObj.message];
    }

    const finalErrorMessage = errorMessages.join('. ');

    response.status(exception.getStatus()).json({
      code: ErrorCode.InvalidParameter,
      message: isProduction ? 'Invalid parameter' : finalErrorMessage,
    });
  }
}
