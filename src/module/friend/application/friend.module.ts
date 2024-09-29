import { forwardRef, Module } from '@nestjs/common';
import { FriendController } from '../adapter/presenter/rest/friend.controller';
import { FriendService } from './friend.service';
import { OrmFriendPersistenceModule } from '../adapter/persistence/orm/orm-friend-persistence.module';
import { OrmUserPersistenceModule } from 'src/module/user/adapter/persistence/orm/orm-user-persistence.module';
import { OrmTimetablePersistenceModule } from 'src/module/timetable/adapter/persistence/orm/orm-timetable-persistence.module';
import { TimetableModule } from 'src/module/timetable/timetable.module';
import { NotificationModule } from 'src/module/notification/application/notification.module';

@Module({
  imports: [
    OrmFriendPersistenceModule,
    OrmUserPersistenceModule,
    OrmTimetablePersistenceModule,
    forwardRef(() => TimetableModule),
    NotificationModule,
  ],
  providers: [FriendService],
  controllers: [FriendController],
  exports: [FriendService],
})
export class FriendModule {}
