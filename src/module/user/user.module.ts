import { Module } from '@nestjs/common';
import { OrmUserPersistenceModule } from './adapter/persistence/orm/orm-user-persistence.module';
import { UserService } from './application/user.service';
import { UserController } from './adapter/presenter/rest/user.controller';

@Module({
  imports: [OrmUserPersistenceModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
