import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ApplicationException } from 'src/common/types/error/application-exceptions.base';
import { EnvironmentService } from 'src/config/environment/environment.service';
import { ReportProvider } from 'src/common/provider/report.provider';
import { ErrorCode } from 'src/common/constants/error-codes';

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
    client.emit('exception', {
      code: exception.code,
      message: this.environmentService.isProduction()
        ? 'An error occurred'
        : exception.message,
    });
  }

  private handleInternalServerError(exception: unknown, client: Socket) {
    this.logger.error('Unexpected error', exception);

    if (!this.environmentService.isLocal()) {
      this.reportError(exception, client);
    }

    client.emit('exception', {
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
      payload: client.data, // 클라이언트에서 전송한 데이터
      query: client.handshake.query, // 연결 시 쿼리 파라미터
      headers: client.handshake.headers, // 연결 시 헤더
      address: client.handshake.address, // 클라이언트 IP 주소
      time: new Date().toISOString(), // 오류 발생 시간
    };

    ReportProvider.error(
      exception instanceof Error ? exception : new Error('Unknown error'),
      errorInfo,
    );
  }
}
