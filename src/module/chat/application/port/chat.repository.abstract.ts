import { UserTimetableEntity } from 'src/module/timetable/adapter/persistence/entities/user-timetable.entity';
import { ChatParticipantEntity } from '../../adapter/persistence/entities/chat-participant.entity';
import { ChatRoomEntity } from '../../adapter/persistence/entities/chat-room.entity';
import { MessageEntity } from '../../adapter/persistence/entities/message.entity';
import { ChatRoom } from '../../domain/chat-room';
import { MessageType } from '../../domain/enums/message-type';

export abstract class ChatRepository {
  abstract findClassChatRoom(
    dto: Pick<ChatRoomEntity, 'schoolId' | 'classId'>,
  ): Promise<ChatRoomEntity | null>;

  abstract findSubjectChatRoomsByTimetable(params: {
    schoolId: number;
    timetables: UserTimetableEntity[];
  }): Promise<ChatRoomEntity[]>;

  abstract saveChatRoomParticipant(
    dtos: Pick<ChatParticipantEntity, 'userId' | 'roomId'>[],
  ): Promise<void>;

  abstract getUserChatRooms(userId: number): Promise<ChatRoom[]>;
  abstract createClassChatRoom(
    dto: Pick<ChatRoomEntity, 'name' | 'schoolId' | 'classId'>,
  ): Promise<ChatRoomEntity>;
  abstract createSubjectChatRooms(
    dto: Pick<
      ChatRoomEntity,
      'name' | 'schoolId' | 'subjectId' | 'day' | 'period'
    >[],
  ): Promise<ChatRoomEntity[]>;
  abstract getChatRoomParticipants(
    roomId: string,
  ): Promise<ChatParticipantEntity[]>;

  abstract findChatRoomByIdOrFail(roomId: string): Promise<ChatRoomEntity>;

  abstract isUserInChatRoom(userId: number, roomId: string): Promise<boolean>;
}
