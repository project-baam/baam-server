import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { BaseEntity } from 'src/config/database/orm/base.entity';
import { UserGrade } from 'src/module/school-dataset/domain/value-objects/grade';
import { SchoolEntity } from './school.entity';

@Unique(['schoolId', 'grade', 'title', 'content', 'date'])
@Entity('school_event', { comment: '학교별 이벤트 정보' }) // 유저가 가입하면 해당 학년 이벤트를 유저_이벤트 테이블에 뿌려주기
export class SchoolEventEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('int')
  schoolId: number;

  @Column({ type: 'enum', enum: UserGrade, comment: '학년' })
  grade: UserGrade;

  @Column('varchar')
  title: string;

  @Column('varchar', { nullable: true })
  content: string | null;

  @Column('timestamp')
  date: Date;

  @ManyToOne(() => SchoolEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'school_id' })
  school: SchoolEntity;
}
