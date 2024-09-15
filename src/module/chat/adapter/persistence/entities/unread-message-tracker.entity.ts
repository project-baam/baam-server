import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { MessageEntity } from './message.entity';
import { UserProfileEntity } from 'src/module/user/adapter/persistence/orm/entities/user-profile.entity';

@Entity('unread_message_tracker')
export class UnreadMessageTrackerEntity {
  @Column('int', { primary: true })
  messageId: number;

  @Column('int', { primary: true })
  userId: number;

  @ManyToOne(() => MessageEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'message_id' })
  message: MessageEntity;

  @ManyToOne(() => UserProfileEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserProfileEntity;
}
