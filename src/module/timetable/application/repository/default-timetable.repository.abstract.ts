import { Semester } from 'src/module/school-dataset/domain/value-objects/semester';
import { DefaultTimetableEntity } from '../../adapter/persistence/orm/entities/default-timetable.entity';
import { UpsertDefaultTimetable } from '../../adapter/persistence/orm/types/default-timetable';

export abstract class DefaultTimetableRepository {
  abstract findDefaultClassTimetable(
    year: number,
    semester: Semester,
    classId: number,
  ): Promise<DefaultTimetableEntity[] | null>;
  abstract upsertMany(timetables: UpsertDefaultTimetable[]): Promise<void>;
}
