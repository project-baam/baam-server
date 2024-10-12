import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { MessageEntity } from './message.entity';
import { ClassSchedule } from 'src/module/chat/domain/types/subject-chatroom-name.types';
import { createHash } from 'crypto';
import { BaseEntity } from 'src/config/database/orm/base.entity';
import { ChatRoomType } from 'src/module/chat/domain/enums/chat-room-type';
import { Weekday } from 'src/module/timetable/domain/enums/weekday';
import { SubjectEntity } from 'src/module/school-dataset/adapter/persistence/orm/entities/subject.entity';
import { SchoolEntity } from 'src/module/school-dataset/adapter/persistence/orm/entities/school.entity';
import { ClassEntity } from 'src/module/school-dataset/adapter/persistence/orm/entities/class.entity';

/**
 * 톡방 종류: 학급톡방 / 과목톡방
 * 학급 톡방 개설 기준: 학교, 학년, 반 당 1 개
 * 과목 톡방 개설 기준: 특정 과목에 대한 수업 "조합"으로 분반 톡방을 개설 (학년 무관)
 */

@Index(['schoolId', 'type'])
@Unique(['name', 'schoolId'])
@Unique(['scheduleHash'])
@Index('idx_class_room', ['schoolId', 'classId'], {
  where: `type = '${ChatRoomType.CLASS}'`,
  unique: true,
})
@Index('idx_subject_room', ['schoolId', 'subjectId', 'scheduleHash'], {
  where: `type = '${ChatRoomType.SUBJECT}'`,
  unique: true,
})
@Check(`
    (type = '${ChatRoomType.CLASS}' AND class_id IS NOT NULL AND subject_id IS NULL AND schedule_hash IS NULL) OR
    (type = '${ChatRoomType.SUBJECT}' AND class_id IS NULL AND subject_id IS NOT NULL AND schedule_hash IS NOT NULL)
  `)
@Entity('chat_room')
export class ChatRoomEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  name: string;

  @Column('enum', { enum: ChatRoomType })
  type: ChatRoomType;

  @Column('int')
  schoolId: number;

  @Column('int', { nullable: true })
  classId: number;

  @Column('int', { nullable: true })
  subjectId: number;

  @Column('varchar', { length: 64, nullable: true }) // SHA-256 hash
  scheduleHash: string;

  @Column('int', { nullable: true })
  lastMessageId: number;

  @Column('int', { default: 0 })
  participantsCount: number;

  @OneToOne(() => MessageEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'last_message_id' })
  lastMessage: MessageEntity;

  @ManyToOne(() => SubjectEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'subject_id' })
  subject: SubjectEntity;

  @ManyToOne(() => SchoolEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'school_id' })
  school: SchoolEntity;

  @ManyToOne(() => ClassEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'class_id' })
  class: ClassEntity;

  static generateName(subjectName: string, schedule: ClassSchedule): string {
    const scheduleString = schedule
      .sort((a, b) => a.day - b.day || a.period - b.period)
      .map((s) => `${this.getKoreanWeekdayShort(s.day)}${s.period}`)
      .join(' ');

    return `[${subjectName}] (${scheduleString})`;
  }

  static generateHash(
    schoolId: number,
    subjectId: number,
    schedule: ClassSchedule,
  ): string {
    const sortedSchedule = schedule.sort(
      (a, b) => a.day - b.day || a.period - b.period,
    );
    const scheduleString = sortedSchedule
      .map((s) => `${s.day}:${s.period}`)
      .join('|');
    const combinedString = `${schoolId}:${subjectId}:${scheduleString}`;
    return createHash('sha256').update(combinedString).digest('hex');
  }

  private static getKoreanWeekdayShort(day: Weekday): string {
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    return weekdays[day];
  }
}
