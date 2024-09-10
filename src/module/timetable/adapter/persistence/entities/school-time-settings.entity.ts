import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { UserProfileEntity } from 'src/module/user/adapter/persistence/orm/entities/user-profile.entity';

@Unique(['userId'])
@Entity('school_time_settings')
export class SchoolTimeSettingsEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('int')
  userId: number;

  // 1 교시 시작 시간
  @Column('time')
  firstPeriodStart: string;

  // 점심시간 시작 시간
  @Column('time')
  lunchTimeStart: string;

  // 점심시간 종료 시간
  @Column('time')
  lunchTimeEnd: string;

  @OneToOne(() => UserProfileEntity, (user) => user.schoolTimeSettings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserProfileEntity;
}
