import { UserTimetableRepository } from 'src/module/timetable/application/repository/user-timetable.repository.abstract';
import { UserTimetableEntity } from '../entities/user-timetable.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DeleteUserTimetable,
  FindUserTimetable,
  UpsertUserTimetable,
} from '../types/user-timetable';

export class OrmUserTimetableRepository implements UserTimetableRepository {
  constructor(
    @InjectRepository(UserTimetableEntity)
    private readonly userTimetableRepository: Repository<UserTimetableEntity>,
  ) {}

  async upsert(
    itemOrItems: UpsertUserTimetable | UpsertUserTimetable[],
  ): Promise<void> {
    await this.userTimetableRepository.upsert(itemOrItems, [
      'userId',
      'year',
      'semester',
      'day',
      'period',
    ]);
  }

  find(where: FindUserTimetable): Promise<UserTimetableEntity[] | null> {
    return this.userTimetableRepository.find({
      where,
      relations: ['subject'],
    });
  }

  async delete(where: DeleteUserTimetable): Promise<void> {
    await this.userTimetableRepository.delete(where);
  }
}
