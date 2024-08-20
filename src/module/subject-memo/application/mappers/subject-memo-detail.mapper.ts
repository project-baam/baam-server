import { plainToInstance } from 'class-transformer';

import { SubjectMemoEntity } from 'src/module/subject-memo/adapter/persistence/orm/entities/subject-memo.entity';
import { SubjectMemoDetail } from '../../domain/subjet-memo-detail';

export class SubjectMemoDetailMapper {
  static toDomain(entity: SubjectMemoEntity): SubjectMemoDetail {
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

  static mapToDomain(entities: SubjectMemoEntity[]): SubjectMemoDetail[] {
    return entities.map((entity) => this.toDomain(entity));
  }
}
