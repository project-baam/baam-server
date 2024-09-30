import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ClassRepository } from 'src/module/school-dataset/application/port/class.repository.abstract';
import { ContentNotFoundError } from 'src/common/types/error/application-exceptions';
import { UserGrade } from 'src/module/school-dataset/domain/value-objects/grade';
import { ClassEntity } from '../entities/class.entity';

export class OrmClassRepository implements ClassRepository {
  constructor(
    @InjectRepository(ClassEntity)
    private readonly classRepository: Repository<ClassEntity>,
  ) {}

  async findByIdOrFail(id: number): Promise<ClassEntity> {
    const data = await this.classRepository.findOne({
      relations: ['school'],
      where: { id },
    });
    if (!data) {
      throw new ContentNotFoundError('class', id);
    }

    return data;
  }

  findAll(): Promise<ClassEntity[]> {
    return this.classRepository.find({ relations: ['school'] });
  }

  async upsertMany(classes: ClassEntity[]): Promise<void> {
    await this.classRepository.upsert(classes, ['schoolId', 'grade', 'name']);
  }

  findBySchoolId(schoolId: number): Promise<ClassEntity[]> {
    return this.classRepository.find({
      relations: ['school'],
      where: { schoolId },
    });
  }

  findBySchoolIdAndGrade(
    schoolId: number,
    grade: UserGrade,
  ): Promise<ClassEntity[]> {
    return this.classRepository.findBy({ schoolId, grade });
  }

  findByNameAndGrade(
    schoolId: number,
    className: string,
    grade: UserGrade,
  ): Promise<ClassEntity | null> {
    return this.classRepository.findOne({
      relations: ['school'],
      where: { name: className, grade, school: { id: schoolId } },
    });
  }

  async findByNameAndGradeOrFail(
    schoolId: number,
    className: string,
    grade: UserGrade,
  ): Promise<ClassEntity> {
    const data = await this.classRepository.findOne({
      relations: ['school'],
      where: { name: className, grade, school: { id: schoolId } },
    });
    if (!data) {
      throw new ContentNotFoundError('class', `${schoolId}-${className}`);
    }

    return data;
  }
}
