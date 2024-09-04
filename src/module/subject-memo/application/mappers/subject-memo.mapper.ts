import dayjs from 'dayjs';
import { SubjectMemo } from '../../domain/subject-memo';
import { EventEntity } from 'src/module/calendar/adapter/persistence/orm/entities/event.entity';

export class SubjectMemoMapper {
  static mapToDomain(entities: EventEntity[]): SubjectMemo[] {
    // entity.subject.name 으로 groupby 해야함
    const groupedMap = new Map<string, SubjectMemo>();

    for (const entity of entities) {
      const subjectName = entity.subject.name;
      let group = groupedMap.get(subjectName);

      if (!group) {
        group = { subjectName, memos: [] };
        groupedMap.set(subjectName, group);
      }

      group.memos.push({
        id: entity.id,
        subjectName,
        title: entity.title,
        memo: entity.memo ?? null,
        datetime: dayjs(entity.datetime).format(),
      });
    }

    return Array.from(groupedMap.values());
  }
}
