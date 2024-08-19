import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { NeisSchoolDatasetProviderService } from './neis-school-data-provider.service';
import { SchoolDatasetProvider } from './school-dataset-provider.abstract';
import { OrmSchoolDatasetPersistenceModule } from '../../persistence/orm/orm-school-dataset-persistence.module';

@Module({
  imports: [HttpModule, OrmSchoolDatasetPersistenceModule],
  providers: [
    {
      provide: SchoolDatasetProvider,
      useClass: NeisSchoolDatasetProviderService,
    },
  ],
  exports: [SchoolDatasetProvider],
})
export class SchoolDatasetProviderModule {}
