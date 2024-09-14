import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoomEntity } from './entities/chat-room.entity';
import { ChatParticipantEntity } from './entities/chat-participant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatRoomEntity, ChatParticipantEntity])],
  providers: [],
  exports: [],
})
export class OrmChatPersistenceModule {}
