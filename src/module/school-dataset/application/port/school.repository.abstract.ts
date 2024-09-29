import { PaginatedList } from 'src/common/dto/response.dto';
import { GetSchoolsRequest } from '../../adapter/presenter/rest/dto/school.dto';
import { SchoolEntity } from '../../adapter/persistence/orm/entities/school.entity';

export abstract class SchoolRepository {
  abstract findByIdOrFail(id: number): Promise<SchoolEntity>;
  abstract upsertMany(schools: Partial<SchoolEntity>[]): Promise<void>;
  abstract getSchoolsPaginated(
    params: GetSchoolsRequest,
  ): Promise<PaginatedList<SchoolEntity>>;
  abstract findUniqueOne(
    officeName: string,
    schoolName: string,
  ): Promise<SchoolEntity | null>;
}
