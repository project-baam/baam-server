import { Global, Module } from '@nestjs/common';
import { HashingService } from './hashing/hashing.service.abstract';
import { BcryptService } from './hashing/bycrypt.service';
import { DateUtilService } from './date-util.service';
import { ChatRoomNameUtilService } from './subject-chatroom-name-util.service';

@Global()
@Module({
  providers: [
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    DateUtilService,
    ChatRoomNameUtilService,
  ],
  exports: [HashingService, DateUtilService, ChatRoomNameUtilService],
})
export class UtilModule {}
