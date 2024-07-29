import { Module } from '@nestjs/common';

import { EnvironmentModule } from './environment/environment.module';
import { IamModule } from './iam/iam.module';
import { UserModule } from './user/user.module';
import { UtilModule } from './util/util.module';
import { InMemoryModule } from './database/in-memory/in-memory.module';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrmConfigModule } from './database/orm/orm.module';
import { OrmConfigService } from './database/orm/orm.service';
import { SchoolDatasetModule } from './school-dataset/school-dataset.module';
import { TimetableModule } from './timetable/timetable.module';

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
  ],
})
export class MainModule {}
