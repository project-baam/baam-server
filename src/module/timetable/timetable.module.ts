import { Module } from '@nestjs/common';
import { TimetableController } from './adapter/presenter/rest/timetable.controller';
import { TimetableService } from './application/timetable.service';
import { OrmTimetablePersistenceModule } from './adapter/persistence/orm-timetable-persistence.module';
import { OrmSchoolDatasetPersistenceModule } from '../school-dataset/adapter/persistence/orm/orm-school-dataset-persistence.module';
import { SchoolDatasetModule } from '../school-dataset/school-dataset.module';

@Module({
  imports: [
    OrmTimetablePersistenceModule,
    OrmSchoolDatasetPersistenceModule,
    SchoolDatasetModule,
  ],
  providers: [TimetableService],
  controllers: [TimetableController],
})
export class TimetableModule {}
