import { Injectable } from '@nestjs/common';
import { InMemoryRepository } from 'src/config/database/in-memory/in-memory.repository.abstract';

@Injectable()
export class TimetableCacheStorage {
  private readonly OPTIMIZED_TIMETABLE_PREFIX = 'optimizedTimetable:';
  private readonly PRECOMPUTED_TIMES_PREFIX = 'precomputedTimes:';

  constructor(private readonly memory: InMemoryRepository) {}

  async setOptimizedTimetable(
    userId: number,
    timetable: Map<string, string>,
  ): Promise<void> {
    const key = this.OPTIMIZED_TIMETABLE_PREFIX + userId;
    await this.memory.set(key, JSON.stringify(Array.from(timetable.entries())));
  }

  async getOptimizedTimetable(
    userId: number,
  ): Promise<Map<string, string> | null> {
    const key = this.OPTIMIZED_TIMETABLE_PREFIX + userId;
    const data = await this.memory.find(key);
    if (!data) return null;
    return new Map(JSON.parse(data));
  }

  async setPrecomputedTimes(userId: number, times: any): Promise<void> {
    const key = this.PRECOMPUTED_TIMES_PREFIX + userId;
    await this.memory.set(key, JSON.stringify(times));
  }

  async getPrecomputedTimes(userId: number): Promise<any | null> {
    const key = this.PRECOMPUTED_TIMES_PREFIX + userId;
    const data = await this.memory.find(key);
    if (!data) return null;

    return JSON.parse(data);
  }

  async removeUserData(userId: number): Promise<void> {
    const optimizedTimetableKey = this.OPTIMIZED_TIMETABLE_PREFIX + userId;
    const precomputedTimesKey = this.PRECOMPUTED_TIMES_PREFIX + userId;
    await Promise.all([
      this.memory.remove(optimizedTimetableKey),
      this.memory.remove(precomputedTimesKey),
    ]);
  }
}
