import { BaseEntity } from 'src/config/database/orm/base.entity';
import { ChatRoomType } from 'src/module/chat/domain/enums/chat-room-type';
import { ClassEntity } from 'src/module/school-dataset/adapter/persistence/entities/class.entity';
import { SchoolEntity } from 'src/module/school-dataset/adapter/persistence/entities/school.entity';
import { SubjectEntity } from 'src/module/school-dataset/adapter/persistence/entities/subject.entity';
import { UserGrade } from 'src/module/school-dataset/domain/value-objects/grade';
import { Period } from 'src/module/timetable/domain/enums/period';
import { Weekday } from 'src/module/timetable/domain/enums/weekday';
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

/**
 * 톡방 종류: 학급톡방 / 과목톡방
 * 학급 톡방 개설 기준: 학교, 학년, 반 당 1 개
 * 과목 톡방 개설 기준: 학교, 학년, 과목, 요일, 교시당 1 개
 */
@Index(['schoolId', 'grade', 'type'])
@Unique(['schoolId', 'grade', 'type', 'classId', 'subjectId', 'day', 'period'])
@Check(`
    (type = '${ChatRoomType.CLASS}' AND class_id IS NOT NULL AND subject_id IS NULL AND day IS NULL AND period IS NULL) OR
    (type = '${ChatRoomType.SUBJECT}' AND class_id IS NULL AND subject_id IS NOT NULL AND day IS NOT NULL AND period IS NOT NULL)
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

  @Column('enum', { enum: UserGrade })
  grade: UserGrade;

  @Column('int', { nullable: true })
  classId: number;

  @Column('int', { nullable: true })
  subjectId: number;

  @Column('enum', { enum: Weekday, nullable: true })
  day: Weekday;

  @Column('enum', { enum: Period, nullable: true })
  period: Period;

  @Column('int', { nullable: true })
  lastMessageId: number;

  @OneToOne(() => MessageEntity, { nullable: true })
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
}
