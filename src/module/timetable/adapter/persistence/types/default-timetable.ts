import { DefaultTimetableEntity } from '../entities/default-timetable.entity';

export type UpsertDefaultTimetable = Pick<
  DefaultTimetableEntity,
  'year' | 'semester' | 'classId' | 'day' | 'period' | 'subjectId'
>;
