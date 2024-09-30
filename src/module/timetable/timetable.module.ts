import { Module } from '@nestjs/common';
import { TimetableController } from './adapter/presenter/rest/timetable.controller';
import { TimetableService } from './application/timetable.service';
import { OrmTimetablePersistenceModule } from './adapter/persistence/orm/orm-timetable-persistence.module';
import { OrmSchoolDatasetPersistenceModule } from '../school-dataset/adapter/persistence/orm/orm-school-dataset-persistence.module';
import { SchoolDatasetModule } from '../school-dataset/school-dataset.module';
import { ChatModule } from '../chat/application/chat.module';
import { SubjectMemoModule } from '../subject-memo/application/subject-memo.module';

@Module({
  imports: [
    OrmTimetablePersistenceModule,
    OrmSchoolDatasetPersistenceModule,
    SchoolDatasetModule,
    ChatModule,
    SubjectMemoModule,
  ],
  providers: [TimetableService],
  controllers: [TimetableController],
  exports: [TimetableService],
})
export class TimetableModule {}
