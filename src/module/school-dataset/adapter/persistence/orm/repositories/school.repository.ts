import { SchoolRepository } from 'src/module/school-dataset/application/port/school.repository.abstract';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, Like, Repository } from 'typeorm';
import { ContentNotFoundError } from 'src/common/types/error/application-exceptions';
import { GetSchoolsRequest } from '../../../presenter/rest/dto/school.dto';
import { PaginatedList } from 'src/common/dto/response.dto';
import { SchoolEntity } from '../entities/school.entity';

export class OrmSchoolRepository implements SchoolRepository {
  constructor(
    @InjectRepository(SchoolEntity)
    private readonly schoolRepository: Repository<SchoolEntity>,
  ) {}

  async findByIdOrFail(id: number): Promise<SchoolEntity> {
    const school = await this.schoolRepository.findOneBy({ id });
    if (!school) {
      throw new ContentNotFoundError('school', id);
    }

    return school;
  }

  async findUniqueOne(
    officeName: string,
    schoolName: string,
  ): Promise<SchoolEntity | null> {
    return this.schoolRepository.findOneBy({ officeName, name: schoolName });
  }

  async upsertMany(schools: SchoolEntity[]): Promise<void> {
    await this.schoolRepository.upsert(schools, ['officeName', 'name']);
  }

  async getSchoolsPaginated(
    params: GetSchoolsRequest,
  ): Promise<PaginatedList<SchoolEntity>> {
    const where: FindOptionsWhere<SchoolEntity> = {};

    if (params.name) {
      where.name = Like(`%${params.name}%`);
    }

    const offset = params.count * params.page;

    const findOptions: FindManyOptions<SchoolEntity> = {
      where,
      skip: offset,
      take: params.count,
    };

    const [list, total] = await this.schoolRepository.findAndCount(findOptions);
    return {
      list,
      total,
    };
  }
}
