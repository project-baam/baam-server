import dayjs from 'dayjs';
import { SubjectMemo } from '../../domain/subject-memo';
import { SubjectMemoEntity } from 'src/module/subject-memo/adapter/persistence/orm/entities/subject-memo.entity';

export class SubjectMemoMapper {
  static mapToDomain(entities: SubjectMemoEntity[]): SubjectMemo[] {
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
        content: entity.content ?? null,
        datetime: dayjs(entity.datetime).format(),
      });
    }

    return Array.from(groupedMap.values());
  }
}
