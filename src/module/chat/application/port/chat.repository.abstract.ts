import { ChatParticipantEntity } from '../../adapter/persistence/entities/chat-participant.entity';
import { ChatRoomEntity } from '../../adapter/persistence/entities/chat-room.entity';
import { MessageEntity } from '../../adapter/persistence/entities/message.entity';
import { ChatRoom } from '../../domain/chat-room';
import { MessageType } from '../../domain/enums/message-type';

export abstract class ChatRepository {
  abstract getUserChatRooms(userId: number): Promise<ChatRoom[]>;
  abstract getChatRoomParticipants(
    roomId: string,
  ): Promise<ChatParticipantEntity[]>;

  abstract findChatRoomByIdOrFail(roomId: string): Promise<ChatRoomEntity>;

  abstract isUserInChatRoom(userId: number, roomId: string): Promise<boolean>;
}
