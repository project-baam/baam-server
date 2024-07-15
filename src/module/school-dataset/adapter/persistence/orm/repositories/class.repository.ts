import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ClassEntity } from '../../entities/class.entity';
import { ClassRepository } from 'src/module/school-dataset/application/port/class.repository';
import { Grade } from 'src/module/school-dataset/domain/value-objects/grade';

export class OrmClassRepository implements ClassRepository {
  constructor(
    @InjectRepository(ClassEntity)
    private readonly classRepository: Repository<ClassEntity>,
  ) {}

  async upsertMany(classes: ClassEntity[]): Promise<void> {
    await this.classRepository.upsert(classes, ['schoolId', 'grade', 'name']);
  }

  findBySchoolId(schoolId: number): Promise<ClassEntity[] | null> {
    return this.classRepository.findBy({ schoolId });
  }

  findBySchoolIdAndGrade(
    schoolId: number,
    grade: Grade,
  ): Promise<ClassEntity[] | null> {
    return this.classRepository.findBy({ schoolId, grade });
  }
}
