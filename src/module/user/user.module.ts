import { Module } from '@nestjs/common';
import { OrmUserPersistenceModule } from './adapter/persistence/orm/orm-user-persistence.module';
import { UserService } from './application/user.service';
import { UserController } from './adapter/presenter/rest/user.controller';
import { OrmSchoolDatasetPersistenceModule } from '../school-dataset/adapter/persistence/orm/orm-school-dataset-persistence.module';
import { ObjectStorageModule } from '../object-storage/application/object-storage.module';
import { TimetableModule } from '../timetable/timetable.module';
import { CalendarModule } from '../calendar/application/calendar.module';
import { ChatModule } from '../chat/application/chat.module';

@Module({
  imports: [
    OrmUserPersistenceModule,
    OrmSchoolDatasetPersistenceModule,
    ObjectStorageModule,
    TimetableModule,
    CalendarModule,
    ChatModule,
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
