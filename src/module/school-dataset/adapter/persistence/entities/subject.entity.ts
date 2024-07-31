import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { BaseEntity } from 'src/module/database/orm/base.entity';
import { CurriculumVersion } from 'src/module/school-dataset/domain/value-objects/curriculum-version';

@Unique(['curriculumVersion', 'name'])
@Entity('subject')
export class SubjectEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'enum', enum: CurriculumVersion })
  curriculumVersion: CurriculumVersion;

  @Column('varchar')
  name: string;

  @Column({ type: 'varchar' })
  category: string;
}
