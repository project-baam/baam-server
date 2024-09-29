import { SchoolEventRepository } from 'src/module/school-dataset/application/port/school-event.repository.abstract';
import { InjectRepository } from '@nestjs/typeorm';
import { And, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { SchoolEventEntity } from '../entities/school-event.entity';

export class OrmSchoolEventRepository implements SchoolEventRepository {
  constructor(
    @InjectRepository(SchoolEventEntity)
    private readonly schoolEventRepository: Repository<SchoolEventEntity>,
  ) {}

  async upsertMany(events: Partial<SchoolEventEntity>[]): Promise<void> {
    await this.schoolEventRepository.upsert(events, [
      'schoolId',
      'grade',
      'title',
      'content',
      'date',
    ]);
  }

  findBySchoolAndDate(
    schoolId: number,
    fromDate: Date,
    toDate: Date,
  ): Promise<SchoolEventEntity[]> {
    return this.schoolEventRepository.find({
      where: {
        schoolId,
        date: And(LessThanOrEqual(toDate), MoreThanOrEqual(fromDate)),
      },
    });
  }
}
