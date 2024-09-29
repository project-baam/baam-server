import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrmSchoolRepository } from './repositories/school.repository';
import { SchoolRepository } from 'src/module/school-dataset/application/port/school.repository.abstract';
import { ClassRepository } from 'src/module/school-dataset/application/port/class.repository.abstract';
import { OrmClassRepository } from './repositories/class.repository';
import { OrmSubjectRepository } from './repositories/subject.repository';
import { SubjectRepository } from 'src/module/school-dataset/application/port/subject.repository.abstract';
import { MealRepository } from 'src/module/school-dataset/application/port/meal.repository.abstract';
import { OrmMealRepository } from './repositories/meal.repository';
import { SchoolEventRepository } from 'src/module/school-dataset/application/port/school-event.repository.abstract';
import { OrmSchoolEventRepository } from './repositories/school-event.repository';
import { ClassEntity } from './entities/class.entity';
import { MealEntity } from './entities/meal.entity';
import { SchoolEventEntity } from './entities/school-event.entity';
import { SchoolEntity } from './entities/school.entity';
import { SubjectEntity } from './entities/subject.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SchoolEntity,
      ClassEntity,
      SubjectEntity,
      MealEntity,
      SchoolEventEntity,
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
    {
      provide: SchoolEventRepository,
      useClass: OrmSchoolEventRepository,
    },
  ],
  exports: [
    SchoolRepository,
    ClassRepository,
    SubjectRepository,
    MealRepository,
    SchoolEventRepository,
  ],
})
export class OrmSchoolDatasetPersistenceModule {}
