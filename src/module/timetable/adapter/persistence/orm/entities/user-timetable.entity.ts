import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { UserEntity } from 'src/module/user/adapter/persistence/orm/entities/user.entity';
import { Semester } from 'src/module/school-dataset/domain/value-objects/semester';
import { Weekday } from 'src/module/timetable/domain/enums/weekday';
import { Period } from 'src/module/timetable/domain/enums/period';
import { SubjectEntity } from 'src/module/school-dataset/adapter/persistence/orm/entities/subject.entity';

@Unique(['userId', 'year', 'semester', 'day', 'period']) // 동일 교시에 중복되는 수업이 없어야 함
@Entity('user_timetable')
export class UserTimetableEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('int')
  userId: number;

  // 학년도
  @Column('int')
  year: number;

  // 학기
  @Column('enum', { enum: Semester })
  semester: Semester;

  // 요일
  @Column('enum', { enum: Weekday })
  day: Weekday;

  // 교시
  @Column('enum', { enum: Period }) // TODO: 확인 필요, 방과후 포함?
  period: Period;

  // 과목
  @Column('int')
  @Index()
  subjectId: number;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => SubjectEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'subject_id' })
  subject: SubjectEntity;
}
