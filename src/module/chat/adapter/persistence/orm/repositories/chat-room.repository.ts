import { ChatParticipantEntity } from './../entities/chat-participant.entity';
import { ChatRoomEntity } from '../entities/chat-room.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ChatRoomType } from 'src/module/chat/domain/enums/chat-room-type';
import { ChatRoom } from 'src/module/chat/domain/chat-room';
import { MessageEntity } from '../entities/message.entity';
import { UnreadMessageTrackerEntity } from '../entities/unread-message-tracker.entity';
import { ContentNotFoundError } from 'src/common/types/error/application-exceptions';
import { ChatRoomRepository } from 'src/module/chat/application/port/chat-room.repository.abstract';
import { MessageEncryptionService } from '../../chat-message-encryption.service';

export class OrmChatRoomRepository implements ChatRoomRepository {
  constructor(
    @InjectRepository(ChatRoomEntity)
    private readonly chatRoomRepository: Repository<ChatRoomEntity>,

    @InjectRepository(ChatParticipantEntity)
    private readonly participantRepository: Repository<ChatParticipantEntity>,

    private messageEncryptionService: MessageEncryptionService,
  ) {}

  async deleteChatRooms(roomIds: string[]): Promise<void> {
    await this.chatRoomRepository.delete(roomIds);
  }

  async findSubjectChatRoomsByUserIdAndSubjectId(
    userId: number,
    subjectId: number,
  ): Promise<ChatRoomEntity[]> {
    return (
      await this.participantRepository.find({
        relations: {
          chatRoom: true,
        },
        where: {
          userId,
          chatRoom: {
            subjectId,
          },
        },
      })
    ).map((e) => e.chatRoom);
  }

  async createSubjectChatRooms(
    dtos: Pick<
      ChatRoomEntity,
      'name' | 'schoolId' | 'subjectId' | 'scheduleHash'
    >[],
  ): Promise<ChatRoomEntity[]> {
    const newChatRooms = await this.chatRoomRepository.save(
      dtos.map((e) => Object.assign(e, { type: ChatRoomType.SUBJECT })),
    );

    return newChatRooms;
  }

  async updateLastMessage(roomId: string, messageId: number): Promise<void> {
    await this.chatRoomRepository.update(roomId, { lastMessageId: messageId });
  }

  async removeUserFromSubjectChatRooms(
    userId: number,
    scheduleHashes: string[],
  ): Promise<void> {
    const chatRooms = await this.chatRoomRepository.find({
      where: { scheduleHash: In(scheduleHashes) },
    });

    const roomIds = chatRooms.map((room) => room.id);

    await this.participantRepository.delete({
      userId,
      roomId: In(roomIds),
    });

    // 채팅방 참여자 수 감소
    for (const id of roomIds) {
      await this.chatRoomRepository.decrement({ id }, 'participantsCount', 1);
    }
  }

  async countChatRoomsForUser(userId: number): Promise<{
    classChatRoomCount: number;
    subjectChatRoomCount: number;
  }> {
    const results = await this.participantRepository
      .createQueryBuilder('participant')
      .innerJoin('participant.chatRoom', 'chatRoom')
      .select('chatRoom.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('participant.userId = :userId', { userId })
      .groupBy('chatRoom.type')
      .getRawMany();

    const counts = {
      classChatRoomCount: 0,
      subjectChatRoomCount: 0,
    };

    results.forEach((result) => {
      if (result.type === ChatRoomType.CLASS) {
        counts.classChatRoomCount = parseInt(result.count);
      } else if (result.type === ChatRoomType.SUBJECT) {
        counts.subjectChatRoomCount = parseInt(result.count);
      }
    });

    return counts;
  }

  async removeUserFromClassChatRoom(
    userId: number,
    oldClassId: number,
  ): Promise<void> {
    const classChatRoom = await this.chatRoomRepository.findOneBy({
      classId: oldClassId,
      type: ChatRoomType.CLASS,
    });
    if (classChatRoom) {
      await this.participantRepository.delete({
        userId,
        roomId: classChatRoom.id,
      });

      // 채팅방 참여자 수 감소
      await this.chatRoomRepository.decrement(
        { id: classChatRoom.id },
        'participantsCount',
        1,
      );
    }
  }

  findClassChatRoom(
    dto: Pick<ChatRoomEntity, 'classId'>,
  ): Promise<ChatRoomEntity | null> {
    return this.chatRoomRepository.findOneBy({
      classId: dto.classId,
    });
  }

  async findSubjectChatRoomByHashes(
    scheduleHashes: string[],
  ): Promise<ChatRoomEntity[]> {
    return this.chatRoomRepository.find({
      relations: {
        subject: true,
      },
      where: { scheduleHash: In(scheduleHashes) },
    });
  }

  async saveChatRoomParticipant(
    dtos: Pick<ChatParticipantEntity, 'userId' | 'roomId'>[],
  ): Promise<void> {
    await this.participantRepository.save(dtos);

    // 채팅방 참여자 수 증가
    for (const dto of dtos) {
      await this.chatRoomRepository.increment(
        { id: dto.roomId },
        'participantsCount',
        1,
      );
    }
  }

  async getUserChatRooms(userId: number): Promise<ChatRoom[]> {
    const chatRooms = await this.chatRoomRepository
      .createQueryBuilder('cr')
      .select('cr.id', 'id')
      .addSelect('cr.name', 'name')
      .addSelect('cr.participants_count', 'participantsCount')
      .addSelect("COALESCE(NULLIF(m.content, ''), m.file_name)", 'lastMessage')
      .addSelect(
        `
      CASE
        WHEN m.created_at IS NULL THEN NULL
        WHEN NOW() - m.created_at < INTERVAL '1 minute' THEN '방금 전'
        WHEN NOW() - m.created_at < INTERVAL '1 hour' THEN CONCAT(EXTRACT(MINUTE FROM NOW() - m.created_at)::int, '분 전')
        WHEN NOW() - m.created_at < INTERVAL '1 day' THEN CONCAT(EXTRACT(HOUR FROM NOW() - m.created_at)::int, '시간 전')
        ELSE CONCAT(EXTRACT(DAY FROM NOW() - m.created_at)::int, '일 전')
      END`,
        'timeAgo',
      )
      .addSelect('COALESCE(umt.unread_count, 0)::int', 'unreadMessageCount')
      .leftJoin(ChatParticipantEntity, 'cp', 'cp.room_id = cr.id')
      .leftJoin(MessageEntity, 'm', 'm.id = cr.last_message_id')
      .leftJoin(
        (qb) => {
          return qb
            .subQuery()
            .select('m.room_id', 'room_id')
            .addSelect('COUNT(*)', 'unread_count')
            .from(UnreadMessageTrackerEntity, 'umt')
            .innerJoin(MessageEntity, 'm', 'umt.message_id = m.id')
            .where('umt.user_id = :userId', { userId })
            .groupBy('m.room_id');
        },
        'umt',
        'umt.room_id = cr.id',
      )
      .where('cp.user_id = :userId', { userId })
      .orderBy('cr.last_message_id', 'DESC')
      .getRawMany();

    return chatRooms.map((chatRoom) => {
      return {
        id: chatRoom.id,
        name: chatRoom.name,
        participantsCount: chatRoom.participantsCount,
        lastMessage: chatRoom.lastMessage
          ? this.messageEncryptionService.decrypt(chatRoom.lastMessage)
          : null,
        timeAgo: chatRoom.timeAgo,
        unreadMessageCount: chatRoom.unreadMessageCount,
      };
    });
  }

  async findUserChatRooms(userId: number): Promise<ChatRoomEntity[]> {
    return (
      await this.participantRepository.find({
        where: { userId },
        relations: {
          chatRoom: true,
        },
      })
    ).map((e) => e.chatRoom);
  }

  async createClassChatRoom(
    dto: Pick<ChatRoomEntity, 'name' | 'schoolId' | 'classId'>,
  ): Promise<ChatRoomEntity> {
    return this.chatRoomRepository.save({
      ...dto,
      type: ChatRoomType.CLASS,
    });
  }

  getChatRoomParticipants(roomId: string): Promise<ChatParticipantEntity[]> {
    return this.participantRepository.find({
      where: { roomId },
      relations: {
        user: {
          class: true,
        },
      },
      order: {
        user: {
          sortKey: 'ASC',
        },
      },
    });
  }

  async isUserInChatRoom(userId: number, roomId: string): Promise<boolean> {
    return this.participantRepository.existsBy({ userId, roomId });
  }

  async findChatRoomByIdOrFail(id: string): Promise<ChatRoomEntity> {
    const room = await this.chatRoomRepository.findOneBy({ id });
    if (!room) {
      throw new ContentNotFoundError('chatroom', id);
    }

    return room;
  }
}
