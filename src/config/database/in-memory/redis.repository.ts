import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import Redis from 'ioredis';

import { EnvironmentService } from 'src/config/environment/environment.service';
import { InMemoryRepository } from './in-memory.repository.abstract';

@Injectable()
export class RedisRepository
  implements InMemoryRepository, OnApplicationShutdown
{
  private memory: Redis;

  constructor(private readonly environmentService: EnvironmentService) {
    this.initializeRedisConnection();
  }

  private initializeRedisConnection() {
    this.memory = new Redis(this.environmentService.get<string>('REDIS_PATH')!);
  }

  async onApplicationShutdown() {
    if (this.memory) {
      await this.memory.quit();
    }
  }

  /**
   * @param ttl 밀리초
   */
  async set(key: string, value: string | number, ttl?: number): Promise<void> {
    if (ttl) {
      await this.memory.set(key, value, 'PX', ttl);
    } else {
      await this.memory.set(key, value);
    }
  }

  async find(key: string): Promise<string | null> {
    return await this.memory.get(key);
  }

  async remove(key: string): Promise<void> {
    await this.memory.del(key);
  }
}
