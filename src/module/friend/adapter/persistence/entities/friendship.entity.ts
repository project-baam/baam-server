import { BaseEntity } from 'src/config/database/orm/base.entity';
import { UserProfileEntity } from 'src/module/user/adapter/persistence/orm/entities/user-profile.entity';
import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('friendship')
@Unique(['userId', 'friendId'])
@Check(`"user_id" < "friend_id"`)
export class FriendshipEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('int')
  userId: number;

  @Column('int')
  friendId: number;

  @Column('boolean', { default: false })
  isUserFavorite: boolean;

  @Column('boolean', { default: false })
  isFriendFavorite: boolean;

  @ManyToOne(() => UserProfileEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserProfileEntity;

  @ManyToOne(() => UserProfileEntity)
  @JoinColumn({ name: 'friend_id' })
  friend: UserProfileEntity;
}
