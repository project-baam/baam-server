import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ClassEntity } from 'src/module/school-dataset/adapter/persistence/entities/class.entity';
import { SubjectEntity } from 'src/module/school-dataset/adapter/persistence/entities/subject.entity';
import { Semester } from 'src/module/school-dataset/domain/value-objects/semester';
import { Period } from 'src/module/timetable/domain/value-objects/period';
import { Weekday } from 'src/module/timetable/domain/value-objects/weekday';
import { BaseEntity } from 'src/module/database/orm/base.entity';

/**
 * 학급별 기본 시간표
 * - 학년도, 학기, (학교+학년+반)=class 에 따라 다름
 */
@Entity('default_timetable')
export class DefaultTimetableEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  // 학년도
  @Column('int')
  year: number;

  // 학기
  @Column('enum', { enum: Semester })
  semester: Semester;

  // 학교 + 학급
  @Column('int')
  classId: number;

  // 과목
  @Column('int')
  subjectId: number;

  // 요일
  @Column('enum', { enum: Weekday })
  day: Weekday;

  // 교시
  @Column('enum', { enum: Period }) // TODO: 확인 필요, 방과후 포함?
  period: Period;

  @ManyToOne(() => ClassEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'class_id' })
  class: ClassEntity;

  @ManyToOne(() => SubjectEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'subject_id' })
  subject: SubjectEntity;
}
