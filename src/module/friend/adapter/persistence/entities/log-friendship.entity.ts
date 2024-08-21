import { BaseEntity } from 'src/config/database/orm/base.entity';
import { LogFriendshipAction } from 'src/module/friend/domain/enums/log-friendship-action.enum';
import { UserProfileEntity } from 'src/module/user/adapter/persistence/orm/entities/user-profile.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('log_friendship')
export class LogFriendshipEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('int')
  userId: number;

  @Column('int')
  friendId: number;

  @Column('enum', {
    enum: LogFriendshipAction,
  })
  action: LogFriendshipAction;

  @ManyToOne(() => UserProfileEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserProfileEntity;

  @ManyToOne(() => UserProfileEntity)
  @JoinColumn({ name: 'friend_id' })
  friend: UserProfileEntity;
}
