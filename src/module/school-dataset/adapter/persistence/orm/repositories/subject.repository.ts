import { PaginatedList } from 'src/common/dto/response.dto';
import { SubjectRepository } from 'src/module/school-dataset/application/port/subject.repository';
import { CurriculumVersion } from 'src/module/school-dataset/domain/value-objects/curriculum-version';
import { SubjectEntity } from '../../entities/subject.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SubjectCategoryResponse } from '../../../presenter/rest/dto/subject-categories.dto';
import { plainToInstance } from 'class-transformer';

export class OrmSubjectRepository implements SubjectRepository {
  constructor(
    @InjectRepository(SubjectEntity)
    private readonly subjectRepository: Repository<SubjectEntity>,
  ) {}

  async findCategories(
    version: CurriculumVersion,
    count: number,
    page: number,
  ): Promise<PaginatedList<SubjectCategoryResponse>> {
    const results = await this.subjectRepository
      .createQueryBuilder('s')
      .select('s.category', 'category')
      .addSelect('COUNT(s.name)', 'subjectsCount')
      .where('s.curriculum_version = :version', { version })
      .groupBy('s.category')
      .orderBy('MIN(s.id)')
      .offset(count * page)
      .limit(count)
      .getRawMany();

    const { total } = await this.subjectRepository
      .createQueryBuilder('s')
      .select('COUNT(DISTINCT s.category)', 'total')
      .where('s.curriculum_version = :version', { version })
      .getRawOne();

    return {
      total: parseInt(total),
      list: plainToInstance(SubjectCategoryResponse, results),
    };
  }

  async findSubjects(
    version: CurriculumVersion,
    count: number,
    page: number,
    filter: { category?: string; search?: string },
  ): Promise<PaginatedList<string>> {
    const query = this.subjectRepository
      .createQueryBuilder('s')
      .select('s.name')
      .where('s.curriculumVersion = :version', { version });

    if (filter?.category) {
      query.andWhere('s.category = :category', { category: filter.category });
    }
    if (filter?.search) {
      query.andWhere('s.name LIKE :name', { name: `%${filter.search}%` });
    }

    query.offset(count * page).limit(count);

    const [subjects, total] = await query.getManyAndCount();

    return { list: subjects.map((e) => e.name) as string[], total };
  }
}
