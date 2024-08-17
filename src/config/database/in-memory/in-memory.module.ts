import { Global, Module } from '@nestjs/common';
import { InMemoryRepository } from './in-memory.repository.abstract';
import { RedisRepository } from './redis.repository';

@Global()
@Module({
  providers: [
    {
      provide: InMemoryRepository,
      useClass: RedisRepository,
    },
  ],
  exports: [InMemoryRepository],
})
export class InMemoryModule {}
