import { BaseEntity } from 'src/config/database/orm/base.entity';
import { FriendRequestStatus } from 'src/module/friend/domain/enums/friend-request-status.enum';
import { UserProfileEntity } from 'src/module/user/adapter/persistence/orm/entities/user-profile.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Unique(['senderId', 'receiverId'])
@Entity('friend_requests')
export class FriendRequestsEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('int')
  senderId: number;

  @Column('varchar')
  receiverId: number; // 친구의 user_id

  @Column('enum', {
    enum: FriendRequestStatus,
    default: FriendRequestStatus.PENDING,
  })
  status: FriendRequestStatus;

  @ManyToOne(() => UserProfileEntity)
  @JoinColumn({ name: 'sender_id' })
  sender: UserProfileEntity;

  @ManyToOne(() => UserProfileEntity)
  @JoinColumn({ name: 'receiver_id' })
  receiver: UserProfileEntity;
}