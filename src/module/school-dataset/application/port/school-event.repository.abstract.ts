import { SchoolEventEntity } from '../../adapter/persistence/orm/entities/school-event.entity';

export abstract class SchoolEventRepository {
  abstract upsertMany(
    events: Pick<
      SchoolEventEntity,
      'schoolId' | 'grade' | 'title' | 'content' | 'date'
    >[],
  ): Promise<void>;
  abstract findBySchoolAndDate(
    schoolId: number,
    fromDate: Date,
    toDate: Date,
  ): Promise<SchoolEventEntity[]>;
}
