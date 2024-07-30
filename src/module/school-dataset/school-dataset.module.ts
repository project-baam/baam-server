import { Module } from '@nestjs/common';

import { OrmSchoolDataasetPersistenceModule } from './adapter/persistence/orm/orm-school-dataset-persistence.module';
import { SchoolDatasetProviderModule } from './adapter/external/school-dataset-provider/school-dataset-provider.module';
import { SchoolDatasetService } from './application/school-dataset.service';
import { SchoolDatasetController } from './adapter/presenter/rest/school-dataset.controller';
import { OrmTimetablePersistenceModule } from '../timetable/adapter/persistence/orm-timetable-persistence.module';

@Module({
  imports: [
    OrmSchoolDataasetPersistenceModule,
    SchoolDatasetProviderModule,
    OrmTimetablePersistenceModule,
  ],
  providers: [SchoolDatasetService],
  controllers: [SchoolDatasetController],
  exports: [SchoolDatasetService],
})
export class SchoolDatasetModule {}
