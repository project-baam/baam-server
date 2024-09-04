import { plainToInstance } from 'class-transformer';
import { EventEntity } from '../../adapter/persistence/orm/entities/event.entity';
import { Event } from './../../domain/event';
import dayjs from 'dayjs';

export class EventMapper {
  static toDomain(event: EventEntity): Event {
    return plainToInstance(
      Event,
      {
        ...event,
        datetime: dayjs(event.datetime).format('YYYY-MM-DD HH:mm:ss'),
        subjectName: event?.subject?.name,
      },
      { excludeExtraneousValues: true },
    );
  }

  static mapToDomain(entities: EventEntity[]): Event[] {
    return entities.map((entity) => this.toDomain(entity));
  }
}
