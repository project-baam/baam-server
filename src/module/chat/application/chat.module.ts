import { Module } from '@nestjs/common';
import { OrmChatPersistenceModule } from '../adapter/persistence/orm-chat-persistence.module';

@Module({
  imports: [OrmChatPersistenceModule],
  providers: [],
  exports: [],
})
export class ChatModule {}
