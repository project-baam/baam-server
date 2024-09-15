import { ChatParticipantEntity } from './../entities/chat-participant.entity';
import { ChatRoomEntity } from '../entities/chat-room.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatRepository } from 'src/module/chat/application/port/chat.repository.abstract';
import { Repository } from 'typeorm';
import { ChatRoomType } from 'src/module/chat/domain/enums/chat-room-type';
import { ChatRoom } from 'src/module/chat/domain/chat-room';
import { MessageEntity } from '../entities/message.entity';
import { UnreadMessageTrackerEntity } from '../entities/unread-message-tracker.entity';
import { MessageType } from 'src/module/chat/domain/enums/message-type';
import { ContentNotFoundError } from 'src/common/types/error/application-exceptions';

export class OrmChatRepository implements ChatRepository {
  constructor(
    @InjectRepository(ChatRoomEntity)
    private readonly chatRoomRepository: Repository<ChatRoomEntity>,

    @InjectRepository(ChatParticipantEntity)
    private readonly participantRepository: Repository<ChatParticipantEntity>,

    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,

    @InjectRepository(UnreadMessageTrackerEntity)
    private readonly unreadMessageTrackerRepository: Repository<UnreadMessageTrackerEntity>,
  ) {}

  async getUserChatRooms(userId: number): Promise<ChatRoom[]> {
    return await this.chatRoomRepository
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
