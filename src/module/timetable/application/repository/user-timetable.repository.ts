import { UserTimetableEntity } from '../../adapter/persistence/entities/user-timetable.entity';
import {
  DeleteUserTimetable,
  FindUserTimetable,
  UpsertUserTimetable,
} from '../../adapter/persistence/types/user-timetable';

export abstract class UserTimetableRepository {
  abstract upsert(
    itemOrItems: UpsertUserTimetable | UpsertUserTimetable[],
  ): Promise<void>;

  abstract find(
    where: FindUserTimetable,
  ): Promise<UserTimetableEntity[] | null>;

  abstract delete(where: DeleteUserTimetable): Promise<void>;
}
