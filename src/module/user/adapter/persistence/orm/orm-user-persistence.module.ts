import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrmUserRepository } from './repositories/user.repository';
import { UserRepository } from 'src/module/user/application/port/user.repository.abstract';
import { UserEntity } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [
    {
      provide: UserRepository,
      useClass: OrmUserRepository,
    },
  ],
  exports: [UserRepository],
})
export class OrmUserPersistenceModule {}
