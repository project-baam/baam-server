import { Module } from '@nestjs/common';
import { OrmEventPersistenceModule } from '../adapter/persistence/orm/orm-event-persistence.module';
import { CalendarController } from '../adapter/presenter/rest/calendar.controller';
import { CalendarService } from './calendar.service';
import { OrmSchoolDatasetPersistenceModule } from 'src/module/school-dataset/adapter/persistence/orm/orm-school-dataset-persistence.module';
import { SchoolDatasetModule } from 'src/module/school-dataset/school-dataset.module';
import { TimetableModule } from 'src/module/timetable/timetable.module';
import { OrmTimetablePersistenceModule } from 'src/module/timetable/adapter/persistence/orm/orm-timetable-persistence.module';
import { NotificationModule } from 'src/module/notification/application/notification.module';

@Module({
  imports: [
    OrmEventPersistenceModule,
    OrmSchoolDatasetPersistenceModule,
    SchoolDatasetModule,
    TimetableModule,
    OrmTimetablePersistenceModule,
    NotificationModule,
  ],
  providers: [CalendarService],
  controllers: [CalendarController],
  exports: [CalendarService],
})
export class CalendarModule {}
