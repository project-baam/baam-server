import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { NeisServiceClient } from './neis-service.client';

@Module({
  imports: [HttpModule],
  providers: [NeisServiceClient],
  exports: [NeisServiceClient],
})
export class NeisServiceModule {}
