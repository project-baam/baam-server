import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Check,
  Index,
} from 'typeorm';
import { UserProfileEntity } from 'src/module/user/adapter/persistence/orm/entities/user-profile.entity';

@Entity('friendships')
@Unique(['user1Id', 'user2Id'])
@Check(`"user1_id" < "user2_id"`)
export class FriendshipEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('int', { name: 'user1_id' })
  @Index()
  user1Id: number;

  @Column('int', { name: 'user2_id' })
  @Index()
  user2Id: number;

  @Column('boolean', { default: false })
  isUser1Favorite: boolean;

  @Column('boolean', { default: false })
  isUser2Favorite: boolean;

  @ManyToOne(() => UserProfileEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user1_id' })
  user1: UserProfileEntity;

  @ManyToOne(() => UserProfileEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user2_id' })
  user2: UserProfileEntity;
}
