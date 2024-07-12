import { Module } from '@nestjs/common';

import { OrmSchoolDataasetPersistenceModule } from './adapter/persistence/orm/orm-school-dataset-persistence.module';
import { SchoolDatasetProviderModule } from './adapter/external/school-dataset-provider/school-dataset-provider.module';
import { SchoolDatasetService } from './application/school-dataset.service';
import { SchoolDatasetController } from './adapter/presenter/rest/school-dataset.controller';

@Module({
  imports: [OrmSchoolDataasetPersistenceModule, SchoolDatasetProviderModule],
  providers: [SchoolDatasetService],
  controllers: [SchoolDatasetController],
})
export class SchoolDatasetModule {}
