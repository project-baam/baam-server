import { Module } from '@nestjs/common';
import { OrmChatPersistenceModule } from '../adapter/persistence/orm-chat-persistence.module';
import { ChatController } from '../adapter/presenter/rest/chat.controller';
import { ChatService } from './chat.service';
import { FriendModule } from 'src/module/friend/application/friend.module';

@Module({
  imports: [OrmChatPersistenceModule, FriendModule],
  providers: [ChatService],
  controllers: [ChatController],
  exports: [],
})
export class ChatModule {}
