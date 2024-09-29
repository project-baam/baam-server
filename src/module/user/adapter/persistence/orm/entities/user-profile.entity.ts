import {
  Entity,
  OneToOne,
  Column,
  PrimaryColumn,
  JoinColumn,
  ManyToOne,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { BaseEntity } from 'src/config/database/orm/base.entity';
import { getInitialAndSortKey } from 'src/module/util/name-util.service';
import { ClassEntity } from 'src/module/school-dataset/adapter/persistence/orm/entities/class.entity';

@Entity('user_profile')
export class UserProfileEntity extends BaseEntity {
  @PrimaryColumn('int', { name: 'user_id' })
  userId: number;

  // 한글 + 영문 최대 10자
  @Column('varchar')
  @Index()
  fullName: string;

  // 초성
  @Column('varchar', { default: '' })
  @Index() // 초성 검색을 위한 인덱스
  initial: string;

  @Column('varchar', { default: '' })
  @Index()
  sortKey: string; // 한글 > 영문

  // 학교 + 학년 + 학급
  @Column('int')
  @Index() // 초성 검색을 위한 인덱스
  classId: number;

  @Column('boolean', { default: true })
  isClassPublic: boolean;

  @Column('boolean', { default: true })
  isTimetablePublic: boolean;

  @Column('varchar', { nullable: true })
  profileImageUrl?: string | null;

  @Column('varchar', { nullable: true })
  backgroundImageUrl?: string | null;

  @Column('boolean', { default: true })
  notificationsEnabled: boolean;

  @OneToOne(() => UserEntity, (user) => user.profile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => ClassEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'class_id' })
  class: ClassEntity;

  @OneToOne(() => UserProfileEntity, (profile) => profile.schoolTimeSettings, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  schoolTimeSettings: UserProfileEntity;

  @BeforeInsert()
  @BeforeUpdate()
  setInitialAndSortKey() {
    const { initial, sortKey } = getInitialAndSortKey(this.fullName);
    this.initial = initial;
    this.sortKey = sortKey;
  }
}
