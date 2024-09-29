import { Module } from '@nestjs/common';
import { SubjectMemoController } from '../adapter/presenter/rest/subject-memo.controller';
import { SubjectMemoService } from './subject-memo.service';
import { OrmSubjectMemoPersistenceModule } from '../adapter/persistence/orm/orm-subject-memo-persistence.module';
import { OrmSchoolDatasetPersistenceModule } from 'src/module/school-dataset/adapter/persistence/orm/orm-school-dataset-persistence.module';
import { OrmTimetablePersistenceModule } from 'src/module/timetable/adapter/persistence/orm/orm-timetable-persistence.module';
import { NotificationModule } from 'src/module/notification/application/notification.module';

@Module({
  imports: [
    OrmSubjectMemoPersistenceModule,
    OrmSchoolDatasetPersistenceModule,
    OrmTimetablePersistenceModule,
    NotificationModule,
  ],
  controllers: [SubjectMemoController],
  providers: [SubjectMemoService],
  exports: [SubjectMemoService],
})
export class SubjectMemoModule {}
