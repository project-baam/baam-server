import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ApplicationException } from 'src/common/types/error/application-exceptions.base';
import { EnvironmentService } from 'src/config/environment/environment.service';
import { ReportProvider } from 'src/common/provider/report.provider';
import { ErrorCode } from 'src/common/constants/error-codes';
import { ChatEvents } from 'src/module/chat/adapter/presenter/websocket/constants/chat-events';

@Catch()
export class WebsocketExceptionFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger(WebsocketExceptionFilter.name);

  constructor(private readonly environmentService: EnvironmentService) {
    super();
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();

    if (exception instanceof ApplicationException) {
      this.handleApplicationException(exception, client);
    } else {
      this.handleInternalServerError(exception, client);
    }
  }

  private handleApplicationException(
    exception: ApplicationException,
    client: Socket,
  ) {
    client.emit(ChatEvents.FromServer.Exception, {
      code: exception.code,
      message: this.environmentService.isProduction()
        ? 'An error occurred'
        : exception.message,
    });
  }

  private handleInternalServerError(exception: any, client: Socket) {
    this.logger.error(exception.message);
    this.logger.error(exception.stack);

    if (!this.environmentService.isLocal()) {
      this.reportError(exception, client);
    }

    client.emit(ChatEvents.FromServer.Exception, {
      code: ErrorCode.InternalServerError,
      message: this.environmentService.isProduction()
        ? 'Internal server error'
        : exception instanceof Error
          ? exception.message
          : 'Unknown error',
    });
  }

  private reportError(exception: unknown, client: Socket) {
    const errorInfo = {
      event: client.eventNames()[0], // 현재 처리 중인 이벤트 이름
      payload: client.data,
      query: client.handshake.query,
      headers: client.handshake.headers,
      address: client.handshake.address,
      time: new Date().toISOString(),
    };

    ReportProvider.error(
      exception instanceof Error ? exception : new Error('Unknown error'),
      errorInfo,
    );
  }
}
