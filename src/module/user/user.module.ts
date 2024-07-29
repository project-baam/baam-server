import { Module } from '@nestjs/common';
import { UserService } from './application/services/user.service';
import { UserController } from './adapter/presenter/rest/user.controller';
import { UserRepositoryImpl } from './adapter/persistence/orm/user.repository';

@Module({
  providers: [
    UserService,
    {
      provide: 'UserRepository',
      useClass: UserRepositoryImpl,
    },
  ],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
