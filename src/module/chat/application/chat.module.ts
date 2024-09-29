import { ObjectStorageModule } from './../../object-storage/application/object-storage.module';
import { forwardRef, Module } from '@nestjs/common';
import { OrmChatPersistenceModule } from '../adapter/persistence/orm/orm-chat-persistence.module';
import { ChatController } from '../adapter/presenter/rest/chat.controller';
import { ChatService } from './chat.service';
import { FriendModule } from 'src/module/friend/application/friend.module';
import { TimetableModule } from 'src/module/timetable/timetable.module';
import { ChatMessageService } from './chat-message.service';
import { ChatGateway } from '../adapter/presenter/websocket/chat.gateway';
import { OrmUserPersistenceModule } from 'src/module/user/adapter/persistence/orm/orm-user-persistence.module';
import { IamModule } from 'src/module/iam/application/iam.module';
import { OrmTimetablePersistenceModule } from 'src/module/timetable/adapter/persistence/orm/orm-timetable-persistence.module';

@Module({
  imports: [
    ObjectStorageModule,
    OrmChatPersistenceModule,
    OrmUserPersistenceModule,
    FriendModule,
    forwardRef(() => IamModule),
    forwardRef(() => TimetableModule),
    OrmTimetablePersistenceModule,
  ],
  providers: [ChatService, ChatMessageService, ChatGateway],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
