import { Module } from '@nestjs/common';
import { OrmEventPersistenceModule } from '../adapter/persistence/orm/orm-event-persistence.module';
import { CalendarController } from '../adapter/presenter/rest/calendar.controller';
import { CalendarService } from './calendar.service';
import { OrmSchoolDatasetPersistenceModule } from 'src/module/school-dataset/adapter/persistence/orm/orm-school-dataset-persistence.module';
import { SchoolDatasetModule } from 'src/module/school-dataset/school-dataset.module';

@Module({
  imports: [
    OrmEventPersistenceModule,
    OrmSchoolDatasetPersistenceModule,
    SchoolDatasetModule,
  ],
  providers: [CalendarService],
  controllers: [CalendarController],
  exports: [CalendarService],
})
export class CalendarModule {}
