import { UserTimetableEntity } from '../../adapter/persistence/entities/user-timetable.entity';
import { Timetable } from '../../domain/timetable';
import { DefaultTimetableEntity } from './../../adapter/persistence/entities/default-timetable.entity';

import { plainToInstance } from 'class-transformer';

export class TimetableMapper {
  static toDomain(
    entity: DefaultTimetableEntity | UserTimetableEntity,
  ): Timetable {
    return plainToInstance(
      Timetable,
      {
        ...entity,
        subject: entity.subject.name,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  static mapToDomain(
    entities: (DefaultTimetableEntity | UserTimetableEntity)[],
  ): Timetable[] {
    return entities.map((entity) => this.toDomain(entity));
  }
}
