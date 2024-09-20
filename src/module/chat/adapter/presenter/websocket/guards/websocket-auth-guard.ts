import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ChatEvents } from '../constants/chat-events';
import { ErrorCode } from 'src/common/constants/error-codes';

@Injectable()
export class WebSocketAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();

    if (!client.user) {
      client.emit(ChatEvents.FromServer.Exception, {
        code: ErrorCode.ChatUnAuthenticated,
        message: '채팅 연결 미인증',
      });
    }

    return true;
  }
}
