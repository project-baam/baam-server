import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class InMemoryRepository {
  abstract set(
    key: string,
    value: string | number,
    ttl?: number,
  ): Promise<void>;

  abstract find(key: string): Promise<string | null>;

  abstract remove(key: string): Promise<void>;
}
