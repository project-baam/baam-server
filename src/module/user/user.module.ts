import { Module } from '@nestjs/common';
import { OrmUserPersistenceModule } from './adapter/persistence/orm/orm-user-persistence.module';
import { UserService } from './application/user.service';
import { UserController } from './adapter/presenter/rest/user.controller';
import { OrmSchoolDatasetPersistenceModule } from '../school-dataset/adapter/persistence/orm/orm-school-dataset-persistence.module';

@Module({
  imports: [OrmUserPersistenceModule, OrmSchoolDatasetPersistenceModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
