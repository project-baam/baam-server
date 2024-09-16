import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoomEntity } from './entities/chat-room.entity';
import { ChatParticipantEntity } from './entities/chat-participant.entity';
import { MessageEntity } from './entities/message.entity';
import { UnreadMessageTrackerEntity } from './entities/unread-message-tracker.entity';
import { OrmChatRepository } from './repositories/chat-room.repository';
import { ChatRepository } from '../../application/port/chat.repository.abstract';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatRoomEntity,
      ChatParticipantEntity,
      MessageEntity,
      UnreadMessageTrackerEntity,
    ]),
  ],
  providers: [
    {
      provide: ChatRepository,
      useClass: OrmChatRepository,
    },
  ],
  exports: [ChatRepository],
})
export class OrmChatPersistenceModule {}
