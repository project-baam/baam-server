import { UserTimetableRepository } from 'src/module/timetable/application/repository/user-timetable.repository.abstract';
import { UserTimetableEntity } from '../entities/user-timetable.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import {
  DeleteUserTimetable,
  FindUserTimetable,
  IsSubjectInUserTimetable,
  UpsertUserTimetable,
} from '../types/user-timetable';
import { CommonSubjects } from 'src/module/school-dataset/domain/constants/common-subjects';
import { SubjectEntity } from 'src/module/school-dataset/adapter/persistence/orm/entities/subject.entity';

export class OrmUserTimetableRepository implements UserTimetableRepository {
  constructor(
    @InjectRepository(UserTimetableEntity)
    private readonly userTimetableRepository: Repository<UserTimetableEntity>,
  ) {}

  async findSubjectsInUserTimetable(
    where: FindUserTimetable,
  ): Promise<string[]> {
    return this.userTimetableRepository
      .createQueryBuilder('userTimetable')
      .innerJoinAndSelect('userTimetable.subject', 'subject')
      .select('DISTINCT subject.name', 'name')
      .where(where)
      .getRawMany()
      .then((userTimetables) => userTimetables.map((e) => e.name as string));
  }

  async isSubjectInUserTimetable(
    where: IsSubjectInUserTimetable,
  ): Promise<boolean> {
    return this.userTimetableRepository
      .count({
        where,
      })
      .then((count) => count > 0);
  }

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

  find(where: FindUserTimetable): Promise<UserTimetableEntity[]> {
    return this.userTimetableRepository.find({
      where,
      relations: ['subject'],
    });
  }

  findUserTimetableBySubject(
    where: FindUserTimetable & Pick<UserTimetableEntity, 'subjectId'>,
  ): Promise<UserTimetableEntity[]> {
    return this.userTimetableRepository.find({
      where,
      relations: ['subject'],
    });
  }

  findNotInCommonSubjects(
    where: FindUserTimetable,
  ): Promise<UserTimetableEntity[]> {
    return this.userTimetableRepository.find({
      where: {
        ...where,
        subject: {
          name: Not(In(CommonSubjects)),
        },
      },
      relations: ['subject'],
    });
  }

  async findSubjectByDayAndPeriod(
    where: DeleteUserTimetable,
  ): Promise<SubjectEntity | null> {
    return (
      (
        await this.userTimetableRepository.findOne({
          where,
          relations: {
            subject: true,
          },
        })
      )?.subject || null
    );
  }

  async delete(where: DeleteUserTimetable): Promise<void> {
    await this.userTimetableRepository.delete(where);
  }
}
