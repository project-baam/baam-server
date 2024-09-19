import { PaginatedList } from 'src/common/dto/response.dto';
import { GetSubjectMemoRequest } from '../../adapter/presenter/rest/dto/subject-memo.dto';
import { EventEntity } from 'src/module/calendar/adapter/persistence/orm/entities/event.entity';

export abstract class SubjectMemoRepository {
  abstract insertOne(
    entity:
      | Pick<
          EventEntity,
          'userId' | 'subjectId' | 'datetime' | 'title' | 'memo'
        >
      | Pick<EventEntity, 'userId' | 'subjectId' | 'datetime' | 'title'>,
  ): Promise<EventEntity>;

  abstract findOneByIdAndUserIdOrFail(
    id: number,
    userId: number,
  ): Promise<EventEntity>;

  abstract updateOne(
    entity: Pick<EventEntity, 'id'> & Partial<EventEntity>,
  ): Promise<void>;

  abstract deleteOne(entity: Pick<EventEntity, 'id'>): Promise<void>;
  abstract deleteBySubject(userId: number, subjectId: number): Promise<void>;

  abstract getMemosPaginated(
    userId: number,
    parmas: GetSubjectMemoRequest,
  ): Promise<PaginatedList<EventEntity>>;

  abstract getMemosByPeriod(
    userId: number,
    period: {
      startDate: Date;
      endDate: Date;
    },
  ): Promise<EventEntity[]>;
}
