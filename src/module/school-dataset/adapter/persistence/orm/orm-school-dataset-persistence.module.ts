import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClassEntity } from './../entities/class.entity';
import { SchoolEntity } from '../entities/school.entity';
import { OrmSchoolRepository } from './repositories/school.repository';
import { SchoolRepository } from 'src/module/school-dataset/application/port/school.repository';
import { ClassRepository } from 'src/module/school-dataset/application/port/class.repository';
import { OrmClassRepository } from './repositories/class.repository';
import { SubjectEntity } from '../entities/subject.entity';
import { OrmSubjectRepository } from './repositories/subject.repository';
import { SubjectRepository } from 'src/module/school-dataset/application/port/subject.repository';
import { MealRepository } from 'src/module/school-dataset/application/port/meal.repository';
import { OrmMealRepository } from './repositories/meal.repository';
import { MealEntity } from '../entities/meal.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SchoolEntity,
      ClassEntity,
      SubjectEntity,
      MealEntity,
    ]),
  ],
  providers: [
    {
      provide: SchoolRepository,
      useClass: OrmSchoolRepository,
    },
    {
      provide: ClassRepository,
      useClass: OrmClassRepository,
    },
    {
      provide: SubjectRepository,
      useClass: OrmSubjectRepository,
    },
    {
      provide: MealRepository,
      useClass: OrmMealRepository,
    },
  ],
  exports: [
    SchoolRepository,
    ClassRepository,
    SubjectRepository,
    MealRepository,
  ],
})
export class OrmSchoolDatasetPersistenceModule {}
