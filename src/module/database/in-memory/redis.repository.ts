import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import Redis from 'ioredis';

import { EnvironmentService } from 'src/module/environment/environment.service';
import { InMemoryRepository } from './in-memory.repository';

@Injectable()
export class RedisRepository
  implements InMemoryRepository, OnApplicationBootstrap, OnApplicationShutdown
{
  private memory: Redis;

  constructor(private readonly environmentService: EnvironmentService) {}

  async onApplicationBootstrap() {
    this.memory = new Redis(this.environmentService.get<string>('REDIS_PATH'));
  }

  onApplicationShutdown() {
    return this.memory.quit();
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

  async find(key: string): Promise<string> {
    return await this.memory.get(key);
  }

  async remove(key: string): Promise<void> {
    await this.memory.del(key);
  }
}
