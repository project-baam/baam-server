import { BaseEntity } from 'src/config/database/orm/base.entity';
import { SubjectEntity } from 'src/module/school-dataset/adapter/persistence/entities/subject.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * user_timetable 이 아닌 subject entity를 참조하는 이유
 * - user_timetable은 같은 과목명이더라도 요일/교시가 다른 중복된 과목명을 가질 수 있음
 * - memo 는 과목으로 묶ㅇ어야 하기 때문에 subject entity를 참조
 */
@Entity('subject_memo')
export class SubjectMemoEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  userId: number;

  @Column('int')
  subjectId: number;

  @Column('int')
  year: number;

  @Column('int')
  semester: number;

  @Column('varchar')
  title: string;

  @Column('varchar', { nullable: true })
  content?: string | null;

  @Column('timestamp')
  datetime: Date;

  @ManyToOne(() => SubjectEntity, {
    onDelete: 'NO ACTION', // TODO:
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'subject_id' })
  subject: SubjectEntity;
}
