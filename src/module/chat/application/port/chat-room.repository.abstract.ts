import { ChatParticipantEntity } from '../../adapter/persistence/orm/entities/chat-participant.entity';
import { ChatRoomEntity } from '../../adapter/persistence/orm/entities/chat-room.entity';
import { ChatRoom } from '../../domain/chat-room';

export abstract class ChatRoomRepository {
  abstract countChatRoomsForUser(userId: number): Promise<{
    classChatRoomCount: number;
    subjectChatRoomCount: number;
  }>;
  abstract findClassChatRoom(
    dto: Pick<ChatRoomEntity, 'classId'>,
  ): Promise<ChatRoomEntity | null>;

  abstract findSubjectChatRoomByHashes(
    scheduleHashes: string[],
  ): Promise<ChatRoomEntity[]>;

  abstract deleteChatRooms(roomIds: string[]): Promise<void>;

  abstract saveChatRoomParticipant(
    dtos: Pick<ChatParticipantEntity, 'userId' | 'roomId'>[],
  ): Promise<void>;

  abstract removeUserFromClassChatRoom(
    userId: number,
    oldClassId: number,
  ): Promise<void>;

  abstract removeUserFromSubjectChatRooms(
    userId: number,
    scheduleHashes: string[],
  ): Promise<void>;

  abstract getUserChatRooms(userId: number): Promise<ChatRoom[]>;
  abstract findUserChatRooms(userId: number): Promise<ChatRoomEntity[]>;

  abstract createClassChatRoom(
    dto: Pick<ChatRoomEntity, 'name' | 'schoolId' | 'classId'>,
  ): Promise<ChatRoomEntity>;
  abstract createSubjectChatRooms(
    dtos: Pick<
      ChatRoomEntity,
      'name' | 'schoolId' | 'subjectId' | 'scheduleHash'
    >[],
  ): Promise<ChatRoomEntity[]>;

  abstract getChatRoomParticipants(
    roomId: string,
  ): Promise<ChatParticipantEntity[]>;

  abstract findChatRoomByIdOrFail(roomId: string): Promise<ChatRoomEntity>;

  abstract isUserInChatRoom(userId: number, roomId: string): Promise<boolean>;

  abstract updateLastMessage(roomId: string, messageId: number): Promise<void>;

  abstract findSubjectChatRoomsByUserIdAndSubjectId(
    userId: number,
    subjectId: number,
  ): Promise<ChatRoomEntity[]>;
}
