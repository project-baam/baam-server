import { BaseEntity } from 'src/config/database/orm/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { ChatRoomEntity } from './chat-room.entity';
import { UserProfileEntity } from 'src/module/user/adapter/persistence/orm/entities/user-profile.entity';

@Unique(['userId', 'roomId'])
@Entity('chat_participant')
export class ChatParticipantEntity extends BaseEntity {
  @Column('int', { primary: true })
  userId: number;

  @Column('uuid', { primary: true })
  roomId: string;

  @ManyToOne(() => UserProfileEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserProfileEntity;

  @ManyToOne(() => ChatRoomEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'room_id' })
  chatRoom: ChatRoomEntity;
}
