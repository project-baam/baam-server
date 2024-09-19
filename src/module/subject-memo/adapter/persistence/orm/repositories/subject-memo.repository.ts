import { SubjectMemoRepository } from 'src/module/subject-memo/application/port/subject-memo.repository.abstract';
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
import { EventEntity } from 'src/module/calendar/adapter/persistence/orm/entities/event.entity';
import { EventType } from 'src/module/calendar/domain/event';

export class OrmSubjectMemoRepository implements SubjectMemoRepository {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventRepository: Repository<EventEntity>,
    private readonly dateUtilService: DateUtilService,
  ) {}

  async findOneByIdAndUserIdOrFail(
    id: number,
    userId: number,
  ): Promise<EventEntity> {
    const memo = await this.eventRepository.findOneBy({
      id,
      userId,
      type: EventType.CLASS,
    });

    if (!memo) {
      throw new ContentNotFoundError(
        'subject-memo(=classtype event):userId:id',
        [userId, id].join(':'),
      );
    }

    return memo;
  }

  async updateOne(
    entity: Pick<EventEntity, 'id'> & Partial<EventEntity>,
  ): Promise<void> {
    await this.eventRepository.update(entity.id, entity);
  }

  async deleteOne(entity: Pick<EventEntity, 'id'>): Promise<void> {
    await this.eventRepository.delete(entity.id);
  }

  async deleteBySubject(userId: number, subjectId: number): Promise<void> {
    await this.eventRepository.delete({
      userId,
      type: EventType.CLASS,
      subjectId,
    });
  }

  getMemosByPeriod(
    userId: number,
    period: {
      startDate: Date;
      endDate: Date;
    },
  ): Promise<EventEntity[]> {
    const where: FindOptionsWhere<EventEntity> = {
      userId,
      type: EventType.CLASS,
    };

    if (period) {
      where.datetime = And(
        MoreThanOrEqual(period.startDate),
        LessThanOrEqual(period.endDate),
      );
    }

    return this.eventRepository.find({
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

  async getMemos(userId: number): Promise<EventEntity[]> {
    return this.eventRepository.find({
      relations: {
        subject: true,
      },
      where: {
        userId,
        type: EventType.CLASS,
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
  ): Promise<PaginatedList<EventEntity>> {
    const [thisSemesterStart, thisSemesterEnd] =
      this.dateUtilService.getThisSemesterRange();

    const [list, total] = await this.eventRepository.findAndCount({
      where: {
        userId,
        datetime: And(
          LessThanOrEqual(dayjs(thisSemesterEnd).endOf('date').toDate()),
          MoreThanOrEqual(dayjs(thisSemesterStart).startOf('date').toDate()),
        ),
        type: EventType.CLASS,
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
          EventEntity,
          'userId' | 'subjectId' | 'datetime' | 'title' | 'memo'
        >
      | Pick<EventEntity, 'userId' | 'subjectId' | 'datetime' | 'title'>,
  ): Promise<EventEntity> {
    const event = this.eventRepository.create({
      ...entity,
      type: EventType.CLASS,
    });
    await this.eventRepository.insert(event);

    return event;
  }
}
