import { BaseEntity } from 'src/config/database/orm/base.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('log_deleted_user')
export class LogDeletedUserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('int')
  userId: number;

  @Column('varchar')
  provider: string; // SignInProvider 가 추후에 변경될 수 있으므로 string 타입 사용

  @Column('varchar')
  providerUserId: string;

  @Column('varchar')
  status: string;

  @CreateDateColumn()
  deletedAt: Date;

  @Column('varchar', { nullable: true })
  fullName: string;

  @Column('int', { nullable: true })
  classId: number;
}
