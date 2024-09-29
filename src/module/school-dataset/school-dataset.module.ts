import { Module } from '@nestjs/common';

import { OrmSchoolDatasetPersistenceModule } from './adapter/persistence/orm/orm-school-dataset-persistence.module';
import { SchoolDatasetProviderModule } from './adapter/external/school-dataset-provider/school-dataset-provider.module';
import { SchoolDatasetService } from './application/school-dataset.service';
import { SchoolDatasetController } from './adapter/presenter/rest/school-dataset.controller';
import { OrmTimetablePersistenceModule } from '../timetable/adapter/persistence/orm/orm-timetable-persistence.module';

@Module({
  imports: [
    OrmSchoolDatasetPersistenceModule,
    SchoolDatasetProviderModule,
    OrmTimetablePersistenceModule,
  ],
  providers: [SchoolDatasetService],
  controllers: [SchoolDatasetController],
  exports: [SchoolDatasetService],
})
export class SchoolDatasetModule {}
