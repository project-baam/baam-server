import { plainToInstance } from 'class-transformer';

import { SubjectMemoDetail } from '../../domain/subjet-memo-detail';
import { EventEntity } from 'src/module/calendar/adapter/persistence/orm/entities/event.entity';

export class SubjectMemoDetailMapper {
  static toDomain(entity: EventEntity): SubjectMemoDetail {
    return plainToInstance(
      SubjectMemoDetail,
      {
        ...entity,
        subjectName: entity.subject.name,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  static mapToDomain(entities: EventEntity[]): SubjectMemoDetail[] {
    return entities.map((entity) => this.toDomain(entity));
  }
}
