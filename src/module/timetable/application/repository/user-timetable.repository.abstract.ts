import { SubjectEntity } from 'src/module/school-dataset/adapter/persistence/entities/subject.entity';
import { UserTimetableEntity } from '../../adapter/persistence/entities/user-timetable.entity';
import {
  DeleteUserTimetable,
  FindUserTimetable,
  IsSubjectInUserTimetable,
  UpsertUserTimetable,
} from '../../adapter/persistence/types/user-timetable';

export abstract class UserTimetableRepository {
  abstract upsert(
    itemOrItems: UpsertUserTimetable | UpsertUserTimetable[],
  ): Promise<void>;

  abstract find(where: FindUserTimetable): Promise<UserTimetableEntity[]>;
  abstract findNotInCommonSubjects(
    where: FindUserTimetable,
  ): Promise<UserTimetableEntity[]>;

  abstract delete(where: DeleteUserTimetable): Promise<void>;

  abstract isSubjectInUserTimetable(
    where: IsSubjectInUserTimetable,
  ): Promise<boolean>;

  abstract findSubjectsInUserTimetable(
    where: FindUserTimetable,
  ): Promise<string[]>;
}
