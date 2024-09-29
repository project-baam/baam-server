import { SubjectEntity } from 'src/module/school-dataset/adapter/persistence/orm/entities/subject.entity';
import { UserTimetableEntity } from '../../adapter/persistence/orm/entities/user-timetable.entity';
import {
  DeleteUserTimetable,
  FindUserTimetable,
  IsSubjectInUserTimetable,
  UpsertUserTimetable,
} from '../../adapter/persistence/orm/types/user-timetable';

export abstract class UserTimetableRepository {
  abstract upsert(
    itemOrItems: UpsertUserTimetable | UpsertUserTimetable[],
  ): Promise<void>;

  abstract findUserTimetableBySubject(
    where: FindUserTimetable & Pick<UserTimetableEntity, 'subjectId'>,
  ): Promise<UserTimetableEntity[]>;

  abstract find(where: FindUserTimetable): Promise<UserTimetableEntity[]>;
  abstract findNotInCommonSubjects(
    where: FindUserTimetable,
  ): Promise<UserTimetableEntity[]>;

  abstract findSubjectByDayAndPeriod(
    where: DeleteUserTimetable,
  ): Promise<SubjectEntity | null>;

  abstract delete(where: DeleteUserTimetable): Promise<void>;

  abstract isSubjectInUserTimetable(
    where: IsSubjectInUserTimetable,
  ): Promise<boolean>;

  abstract findSubjectsInUserTimetable(
    where: FindUserTimetable,
  ): Promise<string[]>;
}
