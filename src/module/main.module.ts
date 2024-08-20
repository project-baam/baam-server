import { Module } from '@nestjs/common';

import { EnvironmentModule } from '../config/environment/environment.module';
import { IamModule } from './iam/application/iam.module';
import { UserModule } from './user/user.module';
import { UtilModule } from './util/util.module';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolDatasetModule } from './school-dataset/school-dataset.module';
import { TimetableModule } from './timetable/timetable.module';
import { OrmConfigModule } from 'src/config/database/orm/orm.config.module';
import { OrmConfigService } from 'src/config/database/orm/orm.config.service';
import { InMemoryModule } from 'src/config/database/in-memory/in-memory.module';
import { ObjectStorageModule } from './object-storage/application/object-storage.module';
import { CalendarModule } from './calendar/application/calendar.module';
import { SubjectMemoModule } from './subject-memo/application/subject-memo.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [OrmConfigModule],
      inject: [OrmConfigService],
      useClass: OrmConfigService,
    }),
    EnvironmentModule,
    UtilModule,
    HttpModule,
    InMemoryModule,
    UserModule,
    IamModule,
    SchoolDatasetModule,
    TimetableModule,
    ObjectStorageModule,
    CalendarModule,
    SubjectMemoModule,
  ],
})
export class MainModule {}
