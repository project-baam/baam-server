import { Module } from '@nestjs/common';
import { OrmUserPersistenceModule } from './adapter/persistence/orm/orm-user-persistence.module';
import { UserService } from './application/user.service';
import { UserController } from './adapter/presenter/rest/user.controller';
import { OrmSchoolDatasetPersistenceModule } from '../school-dataset/adapter/persistence/orm/orm-school-dataset-persistence.module';
import { ObjectStorageModule } from '../object-storage/application/object-storage.module';

@Module({
  imports: [
    OrmUserPersistenceModule,
    OrmSchoolDatasetPersistenceModule,
    ObjectStorageModule,
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
