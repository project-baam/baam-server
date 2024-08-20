import { SubjectMemoRepository } from 'src/module/subject-memo/application/port/subject-memo.repository.abstract';
import { SubjectMemoEntity } from '../entities/subject-memo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  And,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { PaginatedList } from 'src/common/dto/response.dto';
import { GetSubjectMemoRequest } from '../../../presenter/rest/dto/subject-memo.dto';
import { ContentNotFoundError } from 'src/common/types/error/application-exceptions';
import { DateUtilService } from 'src/module/util/date-util.service';
import dayjs from 'dayjs';

export class OrmSubjectMemoRepository implements SubjectMemoRepository {
  constructor(
    @InjectRepository(SubjectMemoEntity)
    private readonly subjectMemoRepository: Repository<SubjectMemoEntity>,
    private readonly dateUtilService: DateUtilService,
  ) {}

  async findOneByIdAndUserIdOrFail(
    id: number,
    userId: number,
  ): Promise<SubjectMemoEntity> {
    const memo = await this.subjectMemoRepository.findOneBy({
      id,
      userId,
    });

    if (!memo) {
      throw new ContentNotFoundError(
        'subject-memo:userId:id',
        [userId, id].join(':'),
      );
    }

    return memo;
  }

  async updateOne(
    entity: Pick<SubjectMemoEntity, 'id'> & Partial<SubjectMemoEntity>,
  ): Promise<void> {
    await this.subjectMemoRepository.update(entity.id, entity);
  }

  async deleteOne(entity: Pick<SubjectMemoEntity, 'id'>): Promise<void> {
    await this.subjectMemoRepository.delete(entity.id);
  }

  getMemosByPeriod(
    userId: number,
    period: {
      startDate: Date;
      endDate: Date;
    },
  ): Promise<SubjectMemoEntity[]> {
    const where: FindOptionsWhere<SubjectMemoEntity> = {
      userId,
    };
    if (period) {
      where.datetime = And(
        MoreThanOrEqual(period.startDate),
        LessThanOrEqual(period.endDate),
      );
    }

    return this.subjectMemoRepository.find({
      relations: {
        subject: true,
      },
      where,
      order: {
        subject: {
          name: 'ASC',
        },
        datetime: 'DESC',
      },
    });
  }

  async getMemos(userId: number): Promise<SubjectMemoEntity[]> {
    return this.subjectMemoRepository.find({
      relations: {
        subject: true,
      },
      where: {
        userId,
      },
      order: {
        subject: {
          name: 'ASC',
        },
        datetime: 'DESC',
      },
    });
  }

  async getMemosPaginated(
    userId: number,
    parmas: GetSubjectMemoRequest,
  ): Promise<PaginatedList<SubjectMemoEntity>> {
    const [thisSemesterStart, thisSemesterEnd] =
      this.dateUtilService.getThisSemesterRange();

    const [list, total] = await this.subjectMemoRepository.findAndCount({
      where: {
        userId,
        datetime: And(
          LessThanOrEqual(dayjs(thisSemesterEnd).endOf('date').toDate()),
          MoreThanOrEqual(dayjs(thisSemesterStart).startOf('date').toDate()),
        ),
      },
      relations: {
        subject: true,
      },
      skip: parmas.count * parmas.page,
      take: parmas.count,
      order: {
        subject: {
          name: 'ASC',
        },
        datetime: 'DESC',
      },
    });

    return {
      list,
      total,
    };
  }

  async insertOne(
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
  ): Promise<void> {
    await this.subjectMemoRepository.insert(entity);
  }
}
