import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { EventType } from 'src/module/calendar/domain/event';
import { UserProfileEntity } from 'src/module/user/adapter/persistence/orm/entities/user-profile.entity';
import { BaseEntity } from 'src/config/database/orm/base.entity';

@Unique(['userId', 'type', 'datetime', 'title'])
@Entity('event')
export class EventEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
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
  memo?: string;

  @ManyToOne(() => UserProfileEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserProfileEntity;
}
