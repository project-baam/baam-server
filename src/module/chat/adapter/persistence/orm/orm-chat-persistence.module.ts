import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoomEntity } from './entities/chat-room.entity';
import { ChatParticipantEntity } from './entities/chat-participant.entity';
import { MessageEntity } from './entities/message.entity';
import { UnreadMessageTrackerEntity } from './entities/unread-message-tracker.entity';

import { ChatRoomRepository } from '../../../application/port/chat-room.repository.abstract';
import { ChatMessageRepository } from '../../../application/port/chat-message.repository.abstract';
import { OrmChatMessageRepository } from './repositories/chat-message.repository';
import { OrmChatRoomRepository } from './repositories/chat-room.repository';
import { LogChatMessageReportEntity } from './entities/log-chat-message-report.entity';
import { MessageEncryptionService } from '../chat-message-encryption.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatRoomEntity,
      ChatParticipantEntity,
      MessageEntity,
      UnreadMessageTrackerEntity,
      LogChatMessageReportEntity,
    ]),
  ],
  providers: [
    {
      provide: ChatRoomRepository,
      useClass: OrmChatRoomRepository,
    },
    {
      provide: ChatMessageRepository,
      useClass: OrmChatMessageRepository,
    },
    MessageEncryptionService,
  ],
  exports: [
    ChatRoomRepository,
    ChatMessageRepository,
    MessageEncryptionService,
  ],
})
export class OrmChatPersistenceModule {}
