import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EventType } from 'src/module/calendar/domain/event';
import { UserProfileEntity } from 'src/module/user/adapter/persistence/orm/entities/user-profile.entity';
import { BaseEntity } from 'src/config/database/orm/base.entity';
import { SubjectEntity } from 'src/module/school-dataset/adapter/persistence/orm/entities/subject.entity';

@Entity('event')
export class EventEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  @Index()
  userId: number;

  @Column('varchar')
  title: string;

  @Column('timestamp')
  datetime: Date;

  @Column({
    type: 'enum',
    enum: EventType,
  })
  type: EventType;

  @Column('varchar', { nullable: true })
  memo?: string | null;

  @Column('int', {
    nullable: true,
    comment: 'type이 EventType.CLASS 일 경우만 참조',
  })
  @Index()
  subjectId: number | null;

  @ManyToOne(() => UserProfileEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserProfileEntity;

  @ManyToOne(() => SubjectEntity, {
    onDelete: 'NO ACTION', // TODO:
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'subject_id' })
  subject: SubjectEntity;
}
