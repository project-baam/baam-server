import { EventType } from 'src/module/calendar/domain/event';
import { UserProfileEntity } from 'src/module/user/adapter/persistence/orm/entities/user-profile.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Unique(['userId', 'type', 'datetime', 'title'])
@Entity('event')
export class EventEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  userId: number;

  @Column('varchar')
  title: string;

  @Column()
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
