import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ApplicationException } from 'src/common/types/error/application-exceptions.base';

@Catch(ApplicationException)
export class WebsocketExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: ApplicationException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();

    client.emit('exception', {
      code: exception.code,
      message: exception.message,
    });
  }
}
