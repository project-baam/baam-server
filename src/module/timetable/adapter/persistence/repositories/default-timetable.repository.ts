import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DefaultTimetableEntity } from '../entities/default-timetable.entity';
import { DefaultTimetableRepository } from 'src/module/timetable/application/repository/default-timetable.repository.abstract';
import { Semester } from 'src/module/school-dataset/domain/value-objects/semester';

export class OrmDefaultTimetableRepository
  implements DefaultTimetableRepository
{
  constructor(
    @InjectRepository(DefaultTimetableEntity)
    private readonly timetableRepository: Repository<DefaultTimetableEntity>,
  ) {}

  async upsertMany(
    timetables: Partial<DefaultTimetableEntity>[],
  ): Promise<void> {
    await this.timetableRepository.upsert(timetables, [
      'year',
      'semester',
      'classId',
      'day',
      'period',
    ]);
  }

  findDefaultClassTimetable(
    year: number,
    semester: Semester,
    classId: number,
  ): Promise<DefaultTimetableEntity[] | null> {
    return this.timetableRepository.find({
      relations: ['subject'],
      where: { year, semester, classId },
    });
  }
}
