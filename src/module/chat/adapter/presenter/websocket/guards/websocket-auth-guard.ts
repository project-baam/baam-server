import { ChatEvents } from '../constants/chat-events';
import { ErrorCode } from 'src/common/constants/error-codes';
import { AuthenticatedSocket } from '../chat.gateway';

export function WebsocketAuthGuard(client: AuthenticatedSocket) {
  if (!client.user) {
    client.emit(ChatEvents.FromServer.Exception, {
      code: ErrorCode.ChatUnAuthenticated,
      message: '채팅 연결 미인증',
    });
  }
}
