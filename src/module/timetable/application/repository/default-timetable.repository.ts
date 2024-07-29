import { Semester } from 'src/module/school-dataset/domain/value-objects/semester';
import { DefaultTimetableEntity } from '../../adapter/persistence/entities/default-timetable.entity';

export abstract class DefaultTimetableRepository {
  abstract findDefaultClassTimetable(
    year: number,
    semester: Semester,
    classId: number,
  ): Promise<DefaultTimetableEntity[] | null>;
}
