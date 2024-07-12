import { ClassEntity } from './../entities/class.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SchoolEntity } from '../entities/school.entity';
import { OrmSchoolRepository } from './repositories/school.repository';
import { SchoolRepository } from 'src/module/school-dataset/application/port/school.repository';
import { ClassRepository } from 'src/module/school-dataset/application/port/class.repository';
import { OrmClassRepository } from './repositories/class.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SchoolEntity, ClassEntity])],
  providers: [
    {
      provide: SchoolRepository,
      useClass: OrmSchoolRepository,
    },
    {
      provide: ClassRepository,
      useClass: OrmClassRepository,
    },
  ],
  exports: [SchoolRepository, ClassRepository],
})
export class OrmSchoolDataasetPersistenceModule {}
