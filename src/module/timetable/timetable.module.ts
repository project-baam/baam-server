import { Module } from '@nestjs/common';
import { TimetableController } from './adapter/presenter/rest/timetable.controller';
import { TimetableService } from './application/timetable.service';
import { OrmTimetablePersistenceModule } from './adapter/persistence/orm-timetable-persistence.module';
import { OrmSchoolDataasetPersistenceModule } from '../school-dataset/adapter/persistence/orm/orm-school-dataset-persistence.module';

@Module({
  imports: [OrmTimetablePersistenceModule, OrmSchoolDataasetPersistenceModule],
  providers: [TimetableService],
  controllers: [TimetableController],
})
export class TimetableModule {}
