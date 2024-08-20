import { PaginatedList } from 'src/common/dto/response.dto';
import { SubjectMemoEntity } from '../../adapter/persistence/orm/entities/subject-memo.entity';
import { GetSubjectMemoRequest } from '../../adapter/presenter/rest/dto/subject-memo.dto';

export abstract class SubjectMemoRepository {
  abstract insertOne(
    entity:
      | Pick<
          SubjectMemoEntity,
          | 'userId'
          | 'subjectId'
          | 'year'
          | 'semester'
          | 'datetime'
          | 'title'
          | 'content'
        >
      | Pick<
          SubjectMemoEntity,
          'userId' | 'subjectId' | 'year' | 'semester' | 'datetime' | 'title'
        >,
  ): Promise<void>;

  abstract findOneByIdAndUserIdOrFail(
    id: number,
    userId: number,
  ): Promise<SubjectMemoEntity>;

  abstract updateOne(
    entity: Pick<SubjectMemoEntity, 'id'> & Partial<SubjectMemoEntity>,
  ): Promise<void>;

  abstract deleteOne(entity: Pick<SubjectMemoEntity, 'id'>): Promise<void>;

  abstract getMemosPaginated(
    userId: number,
    parmas: GetSubjectMemoRequest,
  ): Promise<PaginatedList<SubjectMemoEntity>>;

  abstract getMemosByPeriod(
    userId: number,
    period: {
      startDate: Date;
      endDate: Date;
    },
  ): Promise<SubjectMemoEntity[]>;
}
