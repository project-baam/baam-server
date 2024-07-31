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

@Module({
  imports: [
    TypeOrmModule.forFeature([SchoolEntity, ClassEntity, SubjectEntity]),
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
  ],
  exports: [SchoolRepository, ClassRepository, SubjectRepository],
})
export class OrmSchoolDatasetPersistenceModule {}
