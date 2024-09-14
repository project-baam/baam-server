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
import { FriendModule } from './friend/application/friend.module';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { DataSource } from 'typeorm';
import { NotificationModule } from './notification/application/notification.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ChatModule } from './chat/application/chat.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [OrmConfigModule],
      inject: [OrmConfigService],
      useClass: OrmConfigService,
      dataSourceFactory: async (options) => {
        if (!options) {
          throw new Error('Invalid options passed');
        }

        return addTransactionalDataSource({
          dataSource: new DataSource(options),
        });
      },
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
    FriendModule,
    NotificationModule,
    ScheduleModule.forRoot(),
    ChatModule,
  ],
})
export class MainModule {}
