import { Global, Module } from '@nestjs/common';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bycrypt.service';
import { DateUtilService } from './date-util.service';

@Global()
@Module({
  providers: [
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    DateUtilService,
  ],
  exports: [HashingService, DateUtilService],
})
export class UtilModule {}
