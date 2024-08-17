import { Injectable } from '@nestjs/common';
import { InvalidatedRefreshTokenError } from 'src/common/types/error/application-exceptions';
import { InMemoryRepository } from 'src/config/database/in-memory/in-memory.repository.abstract';

@Injectable()
export class RefreshTokenIdsStorage {
  private readonly prefix: string = 'refersh:user';

  constructor(private readonly memory: InMemoryRepository) {}

  async insert(userId: number, tokenId: string): Promise<void> {
    await this.memory.set(this.getKey(userId), tokenId);
  }

  async validate(userId: number, tokenId: string): Promise<boolean> {
    const storedId = await this.memory.find(this.getKey(userId));
    if (storedId !== tokenId) {
      throw new InvalidatedRefreshTokenError();
    }
    return storedId === tokenId;
  }

  async invalidate(userId: number): Promise<void> {
    await this.memory.remove(this.getKey(userId));
  }

  private getKey(userId: number): string {
    return `${this.prefix}:${userId}`;
  }
}
