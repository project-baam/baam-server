import { UserTimetableEntity } from '../entities/user-timetable.entity';

export type UpsertUserTimetable = Pick<
  UserTimetableEntity,
  'userId' | 'year' | 'semester' | 'day' | 'period' | 'subjectId'
>;

export type FindUserTimetable = Pick<
  UserTimetableEntity,
  'userId' | 'year' | 'semester'
>;

export type DeleteUserTimetable = Pick<
  UserTimetableEntity,
  'userId' | 'year' | 'semester' | 'day' | 'period'
>;

export type IsSubjectInUserTimetable = Pick<
  UserTimetableEntity,
  'userId' | 'year' | 'semester' | 'subjectId'
>;
