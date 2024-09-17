import { ChatParticipantEntity } from './../entities/chat-participant.entity';
import { ChatRoomEntity } from '../entities/chat-room.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoomType } from 'src/module/chat/domain/enums/chat-room-type';
import { ChatRoom } from 'src/module/chat/domain/chat-room';
import { MessageEntity } from '../entities/message.entity';
import { UnreadMessageTrackerEntity } from '../entities/unread-message-tracker.entity';
import { ContentNotFoundError } from 'src/common/types/error/application-exceptions';
import { UserTimetableEntity } from 'src/module/timetable/adapter/persistence/entities/user-timetable.entity';
import { Period } from 'src/module/timetable/domain/enums/period';
import { Weekday } from 'src/module/timetable/domain/enums/weekday';
import { ChatRoomRepository } from 'src/module/chat/application/port/chat-room.repository.abstract';

export class OrmChatRoomRepository implements ChatRoomRepository {
  constructor(
    @InjectRepository(ChatRoomEntity)
    private readonly chatRoomRepository: Repository<ChatRoomEntity>,

    @InjectRepository(ChatParticipantEntity)
    private readonly participantRepository: Repository<ChatParticipantEntity>,
  ) {}

  async updateLastMessage(roomId: string, messageId: number): Promise<void> {
    await this.chatRoomRepository.update(roomId, { lastMessageId: messageId });
  }

  // TODO: 
  removeUserFromSubjectChatRooms(
    userId: number,
    subjectId: number,
    day: Weekday,
    period: Period,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  countChatRoomsForUser(userId: number): Promise<number> {
    return this.participantRepository.countBy({ userId });
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
    }
  }

  findClassChatRoom(
    dto: Pick<ChatRoomEntity, 'classId'>,
  ): Promise<ChatRoomEntity | null> {
    return this.chatRoomRepository.findOneBy({
      classId: dto.classId,
    });
  }

  async findSubjectChatRoomsByTimetable(params: {
    schoolId: number;
    timetables: UserTimetableEntity[];
  }): Promise<ChatRoomEntity[]> {
    const { schoolId, timetables } = params;

    await this.chatRoomRepository.query(`
      CREATE TEMPORARY TABLE temp_timetable (
        subject_id INT,
        day INT,
        period INT
      );
  
      INSERT INTO temp_timetable (subject_id, day, period)
      VALUES ${timetables.map((t) => `(${t.subjectId}, ${t.day}, ${t.period})`).join(', ')};
    `);

    const result = await this.chatRoomRepository
      .createQueryBuilder('cr')
      .where('cr.schoolId = :schoolId', { schoolId })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('1')
          .from('temp_timetable', 'tt')
          .where('tt.subject_id = cr.subjectId')
          .andWhere('tt.day::text = cr.day::text')
          .andWhere('tt.period::text = cr.period::text')
          .getQuery();
        return 'EXISTS ' + subQuery;
      })
      .getMany();

    await this.chatRoomRepository.query('DROP TABLE temp_timetable;');

    return result;
  }

  async saveChatRoomParticipant(
    dtos: Pick<ChatParticipantEntity, 'userId' | 'roomId'>[],
  ): Promise<void> {
    await this.participantRepository.save(dtos);
  }

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

  async createClassChatRoom(
    dto: Pick<ChatRoomEntity, 'name' | 'schoolId' | 'classId'>,
  ): Promise<ChatRoomEntity> {
    return this.chatRoomRepository.save({
      ...dto,
      type: ChatRoomType.CLASS,
    });
  }

  async createSubjectChatRooms(
    dto: Pick<
      ChatRoomEntity,
      'name' | 'schoolId' | 'subjectId' | 'day' | 'period'
    >[],
  ): Promise<ChatRoomEntity[]> {
    return this.chatRoomRepository.save(
      dto.map((e) => ({
        ...e,
        type: ChatRoomType.SUBJECT,
      })),
    );
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
