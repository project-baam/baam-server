import { InjectRepository } from '@nestjs/typeorm';
import {
  And,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';

import { EventRepository } from 'src/module/calendar/application/port/event.repository.abstract';
import { EventEntity } from '../entities/event.entity';
import { ContentNotFoundError } from 'src/common/types/error/application-exceptions';
import { EventType } from 'src/module/calendar/domain/event';

export class OrmEventRepository implements EventRepository {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventRepository: Repository<EventEntity>,
  ) {}

  insertOne(
    event:
      | Pick<EventEntity, 'userId' | 'type' | 'title' | 'datetime'>
      | Pick<EventEntity, 'userId' | 'type' | 'title' | 'datetime' | 'memo'>,
  ): Promise<EventEntity> {
    return this.eventRepository.save(event);
  }

  async findOneByIdOrFail(userId: number, id: number): Promise<EventEntity> {
    const event = await this.eventRepository.findOneBy({ userId, id });
    if (!event) {
      throw new ContentNotFoundError('user:event', `${userId}:${id}`);
    }

    return event;
  }

  getManyByMonth(
    userId: number,
    year: number,
    month: number,
    type?: EventType,
  ): Promise<EventEntity[]> {
    const where: FindOptionsWhere<EventEntity> = {
      userId,
      datetime: And(
        LessThanOrEqual(new Date(year, month + 1, 0)),
        MoreThanOrEqual(new Date(year, month, 1)),
      ),
    };
    if (type) {
      where.type = type;
    }

    return this.eventRepository.find({
      relations: {
        subject: true,
      },
      where,
      order: {
        datetime: 'ASC',
      },
    });
  }

  async insertMany(
    events:
      | Pick<EventEntity, 'userId' | 'type' | 'title' | 'datetime'>[]
      | Pick<EventEntity, 'userId' | 'type' | 'title' | 'datetime' | 'memo'>[],
  ): Promise<void> {
    await this.eventRepository.insert(events);
  }

  async updateOne(
    event: Pick<EventEntity, 'id'> & Partial<EventEntity>,
  ): Promise<void> {
    await this.eventRepository.update(event.id, event);
  }

  async deleteOne(id: number): Promise<void> {
    await this.eventRepository.delete(id);
  }
}
