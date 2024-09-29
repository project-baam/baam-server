import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { BaseEntity } from 'src/config/database/orm/base.entity';
import { MealType } from 'src/module/school-dataset/domain/value-objects/meal-type';
import { SchoolEntity } from './school.entity';

@Unique(['schoolId', 'date', 'type'])
@Entity('meal', { comment: '학교별 급식 정보' })
export class MealEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('varchar', { length: 10, comment: 'YYYY-MM-DD' })
  date: string;

  @Column('int')
  schoolId: number;

  @Column({ type: 'enum', enum: MealType, comment: '식사구분' })
  type: MealType;

  @Column('simple-array', { comment: '급식메뉴' })
  menu: string[];

  @ManyToOne(() => SchoolEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'school_id' })
  school: SchoolEntity;
}
