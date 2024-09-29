import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendRepository } from '../../../application/port/friend.repository.abstract';
import { OrmFriendRepository } from './repositories/friendship.repository';
import { FriendshipEntity } from './entities/friendship.entity';
import { FriendRequestsEntity } from './entities/friend-requests.entity';
import { UserProfileEntity } from 'src/module/user/adapter/persistence/orm/entities/user-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FriendshipEntity,
      FriendRequestsEntity,
      UserProfileEntity,
    ]),
  ],
  providers: [
    {
      provide: FriendRepository,
      useClass: OrmFriendRepository,
    },
  ],
  exports: [FriendRepository],
})
export class OrmFriendPersistenceModule {}
