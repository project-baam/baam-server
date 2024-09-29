import { plainToInstance } from 'class-transformer';
import { SchoolEvent } from '../../domain/event';
import dayjs from 'dayjs';
import { SchoolEventEntity } from '../../adapter/persistence/orm/entities/school-event.entity';

export class SchoolEventMapper {
  static toDomain(entity: SchoolEventEntity): SchoolEvent {
    return plainToInstance(SchoolEvent, entity, {
      excludeExtraneousValues: true,
    });
  }

  static toPersistence(
    event: SchoolEvent,
    schoolId: number,
  ): Pick<
    SchoolEventEntity,
    'schoolId' | 'grade' | 'title' | 'content' | 'date'
  > {
    return {
      schoolId,
      ...event,
      date: dayjs(event.date).toDate(),
    };
  }
}
