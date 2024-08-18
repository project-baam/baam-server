import {
  Entity,
  OneToOne,
  Column,
  PrimaryColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { BaseEntity } from 'src/config/database/orm/base.entity';
import { ClassEntity } from 'src/module/school-dataset/adapter/persistence/entities/class.entity';

@Entity('user_profile')
export class UserProfileEntity extends BaseEntity {
  @PrimaryColumn('int')
  userId: number;

  @Column('varchar')
  fullName: string;

  // 학교 + 학년 + 학급
  @Column('int')
  classId: number;

  @Column('boolean', { default: true }) // TODO: 확인 필요
  isProfilePublic: boolean;

  @Column('varchar', { nullable: true })
  profileImageUrl?: string | null;

  @OneToOne(() => UserEntity, (user) => user.profile, {
    cascade: true,
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => ClassEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'class_id' })
  class: ClassEntity;
}
