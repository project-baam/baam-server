import { BaseEntity } from 'src/config/database/orm/base.entity';
import { UserProfileEntity } from 'src/module/user/adapter/persistence/orm/entities/user-profile.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Unique(['userId', 'friendId'])
@Entity('friendship')
export class FriendshipEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('int')
  userId: number;

  @Column('int')
  friendId: number; // 친구의 user_id

  @Column('boolean', { default: false })
  isFavorite: boolean;

  @ManyToOne(() => UserProfileEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserProfileEntity;

  @ManyToOne(() => UserProfileEntity)
  @JoinColumn({ name: 'friend_id' })
  friend: UserProfileEntity;
}
