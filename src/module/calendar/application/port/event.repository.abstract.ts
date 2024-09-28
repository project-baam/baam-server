import { EventEntity } from '../../adapter/persistence/orm/entities/event.entity';
import { EventType } from '../../domain/event';

export abstract class EventRepository {
  /**
s   * @param month  0 ~ 11
   */
  abstract getManyByMonth(
    userId: number,
    year: number,
    month: number,
    type?: EventType,
  ): Promise<EventEntity[]>;
  abstract insertOne(
    event:
      | Pick<EventEntity, 'userId' | 'type' | 'title' | 'datetime'>
      | Pick<EventEntity, 'userId' | 'type' | 'title' | 'datetime' | 'memo'>
      | Pick<
          EventEntity,
          'userId' | 'type' | 'title' | 'datetime' | 'memo' | 'subjectId'
        >
      | Pick<
          EventEntity,
          'userId' | 'type' | 'title' | 'datetime' | 'subjectId'
        >,
  ): Promise<EventEntity>;
  abstract insertMany(
    events:
      | Pick<EventEntity, 'userId' | 'type' | 'title' | 'datetime'>[]
      | Pick<EventEntity, 'userId' | 'type' | 'title' | 'datetime' | 'memo'>[],
  ): Promise<void>;
  abstract findOneByIdOrFail(userId: number, id: number): Promise<EventEntity>;
  abstract updateOne(
    event: Pick<EventEntity, 'id'> & Partial<EventEntity>,
  ): Promise<void>;
  abstract deleteOne(id: number): Promise<void>;
}
