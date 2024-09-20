import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets';
import { forwardRef, Inject, Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AppWebsocketGateway } from 'src/common/decorator/websocket-api.decorator';
import { SendFileMessageDto, SendTextMessageDto } from './dto/send-message.dto';
import { AuthenticationService } from 'src/module/iam/application/authentication.service';
import { UserEntity } from 'src/module/user/adapter/persistence/orm/entities/user.entity';
import { ChatMessageService } from './../../../application/chat-message.service';
import { ChatService } from 'src/module/chat/application/chat.service';
import {
  IncompleteProfileError,
  InvalidAccessTokenError,
  UserNotOnlineInRoomError,
} from 'src/common/types/error/application-exceptions';
import { UserStatus } from 'src/module/user/domain/enum/user-status.enum';
import { JoinRoomDto } from './dto/join-room.dto';
import { LeaveRoomDto } from './dto/leave-room.dto';
import { ChatEvents } from './constants/chat-events';
import { ChatMessageMapper } from 'src/module/chat/application/mappers/chat-message.mapper';
import { ErrorCode } from 'src/common/constants/error-codes';
import { Message } from 'src/module/chat/domain/message';
import { WebsocketAuthGuard } from './guards/websocket-auth-guard';

export interface AuthenticatedSocket extends Socket {
  user: UserEntity;
}

@AppWebsocketGateway({
  namespace: 'chat',
  // cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userChatListPageMap: Map<number, boolean> = new Map();
  private userRoomMap: Map<number, Set<string>> = new Map();
  private userSocketMap: Map<number, Set<string>> = new Map();

  // 사용자가 채팅 목록 페이지에 있는지 확인
  isUserOnChatListPage(userId: number): boolean {
    return this.userChatListPageMap.has(userId);
  }

  // 사용자가 특정 채팅방에 참여하고 있는지 확인
  isUserInRoom(userId: number, roomId: string): boolean {
    const rooms = this.userRoomMap.get(userId) || new Set();
    return rooms.has(roomId);
  }

  constructor(
    @Inject(forwardRef(() => ChatMessageService))
    private readonly chatMessageService: ChatMessageService,
    private readonly chatService: ChatService,
    private readonly iamService: AuthenticationService,
  ) {}

  // 채팅 목록 화면 진입 시
  async handleConnection(client: AuthenticatedSocket) {
    try {
      const user = await this.iamService.validateAccessToken(
        this.extractTokenFromHeader(client),
      );
      client.user = user;

      if (user?.status === UserStatus.INCOMPLETE_PROFILE) {
        throw new IncompleteProfileError();
      }

      this.userChatListPageMap.set(user.id, true);

      const sockets = this.userSocketMap.get(user.id) || new Set();
      sockets.add(client.id);
      this.userSocketMap.set(user.id, sockets);

      Logger.log(
        `User ${user.id} connected(채팅 목록 화면 진입)`,
        ChatGateway.name,
      );
    } catch (error) {
      this.handleConnectionError(error, client);
    }
  }

  private handleConnectionError(error: any, client: Socket) {
    if (error instanceof InvalidAccessTokenError) {
      client.emit(ChatEvents.FromServer.Exception, {
        code: ErrorCode.InvalidAccessToken,
        message: 'Invalid access token',
      });
    } else {
      client.emit(ChatEvents.FromServer.Exception, {
        code: ErrorCode.InternalServerError,
        message: 'Internal server error',
      });
    }
    client.disconnect();
  }

  // 채팅 목록 화면 나갈 시
  handleDisconnect(client: AuthenticatedSocket) {
    if (client.user) {
      const userId = client.user.id;
      this.userChatListPageMap.delete(userId);

      const sockets = this.userSocketMap.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSocketMap.delete(userId);
        }
      }

      this.userRoomMap.delete(userId);

      Logger.log(
        `User ${userId} disconnected(채팅목록 화면 나감)`,
        ChatGateway.name,
      );
    }
  }

  // 채팅방 입장
  @SubscribeMessage(ChatEvents.FromClient.JoinRoom)
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: JoinRoomDto,
  ) {
    WebsocketAuthGuard(client);
    await this.chatService.isUserInChatRoomOrFail(
      client.user.id,
      payload.roomId,
    );

    client.join(payload.roomId);

    const rooms = this.userRoomMap.get(client.user.id) || new Set();
    rooms.add(payload.roomId);
    this.userRoomMap.set(client.user.id, rooms);

    console.log(`User ${client.user.id} joined room ${payload.roomId}`);

    this.sendUndeliveredMessages(payload.roomId, client.user.id);
  }

  // 채팅방 퇴장
  @SubscribeMessage(ChatEvents.FromClient.LeaveRoom)
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: LeaveRoomDto,
  ) {
    WebsocketAuthGuard(client);

    client.leave(payload.roomId);

    const rooms = this.userRoomMap.get(client.user.id) || new Set();
    rooms.delete(payload.roomId);
    this.userRoomMap.set(client.user.id, rooms);

    console.log(`User ${client.user.id} left room ${payload.roomId}`);
  }

  @SubscribeMessage(ChatEvents.FromClient.SendTextMessage)
  async handleSendTextMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    payload: SendTextMessageDto,
  ) {
    WebsocketAuthGuard(client);

    const userId = client.user.id;

    if (!this.isUserInRoom(userId, payload.roomId)) {
      throw new UserNotOnlineInRoomError(payload.roomId, userId);
    }
    await this.chatMessageService.sendTextMessage(
      payload.roomId,
      client.user.id,
      payload.content,
    );
  }

  @SubscribeMessage(ChatEvents.FromClient.SendFileMessage)
  async handleSendFileMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    payload: SendFileMessageDto,
  ) {
    WebsocketAuthGuard(client);

    const userId = client.user.id;
    const { roomId, fileName, fileType, fileSize, fileData } = payload;
    const buffer = Buffer.from(fileData);

    await this.chatMessageService.sendFileMessage(
      roomId,
      userId,
      buffer,
      fileName,
      fileSize,
      fileType,
    );
  }

  sendMessageToUser(userId: number, message: Message): void {
    const socketIds = this.userSocketMap.get(userId);
    if (socketIds) {
      socketIds.forEach((socketId) => {
        this.server
          .to(socketId)
          .emit(ChatEvents.FromServer.NewMessage, message);
      });
    }
  }

  private extractTokenFromHeader(client: any): string | undefined {
    return (
      client.handshake.auth?.token?.split(' ')[1] ||
      client.handshake.auth?.token ||
      client.handshake.headers.authorization?.split(' ')[1]
    );
  }

  private async sendUndeliveredMessages(
    roomId: string,
    userId: number,
  ): Promise<void> {
    const undeliveredMessages =
      await this.chatMessageService.getUndeliveredMessages(roomId, userId);
    const socketIds = this.userSocketMap.get(userId);
    if (socketIds && undeliveredMessages.length) {
      socketIds.forEach((socketId) => {
        this.server
          .to(socketId)
          .emit(
            ChatEvents.FromServer.NewMessages,
            ChatMessageMapper.mapToDomain(undeliveredMessages),
          );
      });
      await this.chatMessageService.markMessagesAsDelivered(
        undeliveredMessages.map((e) => e.id),
        userId,
      );
    }
  }
}
