import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatRoomEntity } from './chat-room.entity';
import { UserProfileEntity } from 'src/module/user/adapter/persistence/orm/entities/user-profile.entity';
import { BaseEntity } from 'src/config/database/orm/base.entity';
import { MessageType } from 'src/module/chat/domain/enums/message-type';

@Entity('message')
export class MessageEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('enum', { enum: MessageType })
  type: MessageType;

  @Column('text', { nullable: true })
  content: string;

  @Column('varchar', { nullable: true })
  fileUrl?: string;

  @Column('varchar', { nullable: true })
  fileName?: string;

  @Column('int', { nullable: true })
  fileSize?: number;

  @Column('timestamp', { nullable: true })
  fileExpiredAt?: Date;

  @Column('uuid')
  @Index()
  roomId: string;

  @Column('int', { nullable: true, comment: '시스템 메시지일 경우 null' })
  senderId: number;

  @Column({ default: false })
  isLastMessage: boolean;

  // Message 는 ChatRoom 이 사라지면 같이 사라지고, Sender 가 사라져도 Message 는 남아있어야 한다.
  @ManyToOne(() => ChatRoomEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'room_id' })
  chatRoom: ChatRoomEntity;

  @ManyToOne(() => UserProfileEntity, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'sender_id' })
  sender: UserProfileEntity;
}
