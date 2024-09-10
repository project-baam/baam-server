import { Module } from '@nestjs/common';
import { FriendController } from '../adapter/presenter/rest/friend.controller';
import { FriendService } from './friend.service';
import { OrmFriendPersistenceModule } from '../adapter/persistence/orm-friend-persistence.module';
import { OrmUserPersistenceModule } from 'src/module/user/adapter/persistence/orm/orm-user-persistence.module';
import { OrmTimetablePersistenceModule } from 'src/module/timetable/adapter/persistence/orm-timetable-persistence.module';
import { TimetableModule } from 'src/module/timetable/timetable.module';

@Module({
  imports: [
    OrmFriendPersistenceModule,
    OrmUserPersistenceModule,
    OrmTimetablePersistenceModule,
    TimetableModule,
  ],
  providers: [FriendService],
  controllers: [FriendController],
})
export class FriendModule {}
