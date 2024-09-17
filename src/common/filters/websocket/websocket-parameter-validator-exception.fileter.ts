import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { ErrorCode } from 'src/common/constants/error-codes';
import { EnvironmentService } from '../../../config/environment/environment.service';
import { Socket } from 'socket.io';
import { ChatEvents } from 'src/module/chat/adapter/presenter/websocket/constants/chat-events';

@Catch(BadRequestException)
export class WebsocketParameterValidationExceptionFilter
  implements ExceptionFilter<BadRequestException>
{
  constructor(private readonly environmentService: EnvironmentService) {}

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();
    const exceptionObj = exception.getResponse() as Record<string, any>;
    const isProduction = this.environmentService.isProduction();

    let errorMessages: string[] = [];

    if (Array.isArray(exceptionObj.message)) {
      errorMessages = exceptionObj.message.map((error: any) => {
        if (error.constraints) {
          return Object.values(error.constraints).join('. ');
        }
        return error.toString();
      });
    } else if (typeof exceptionObj.message === 'string') {
      errorMessages = [exceptionObj.message];
    }

    const finalErrorMessage = errorMessages.join('. ');

    client.emit(ChatEvents.FromServer.Exception, {
      code: ErrorCode.InvalidParameter,
      message: isProduction ? 'Invalid parameter' : finalErrorMessage,
    });
  }
}
