import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrmUserRepository } from './repositories/user.repository';
import { UserRepository } from 'src/module/user/application/port/user.repository.abstract';
import { UserEntity } from './entities/user.entity';
import { UserProfileEntity } from './entities/user-profile.entity';
import { LogDeletedUserEntity } from './entities/log-deleted-user.entity';
import { LogLoginEntity } from './entities/log-login.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserProfileEntity,
      LogDeletedUserEntity,
      LogLoginEntity,
    ]),
  ],
  providers: [
    {
      provide: UserRepository,
      useClass: OrmUserRepository,
    },
  ],
  exports: [UserRepository],
})
export class OrmUserPersistenceModule {}
