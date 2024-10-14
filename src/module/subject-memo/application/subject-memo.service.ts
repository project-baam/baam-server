import { NotificationService } from 'src/module/notification/application/notification.service';
import { UserTimetableRepository } from 'src/module/timetable/application/repository/user-timetable.repository.abstract';
import { SubjectRepository } from 'src/module/school-dataset/application/port/subject.repository.abstract';
import { Injectable } from '@nestjs/common';
import { SubjectMemoRepository } from './port/subject-memo.repository.abstract';
import {
  CreateSubjectMemoRequest,
  GetSubjectMemoRequest,
  UpdateSubjectMemoRequest,
} from '../adapter/presenter/rest/dto/subject-memo.dto';
import { DateUtilService } from 'src/module/util/date-util.service';
import dayjs from 'dayjs';
import { PaginatedList } from 'src/common/dto/response.dto';
import { SubjectMemo } from '../domain/subject-memo';
import { SubjectMemoMapper } from 'src/module/subject-memo/application/mappers/subject-memo.mapper';
import { SubjectMemoDetailMapper } from './mappers/subject-memo-detail.mapper';
import { SubjectMemoDetail } from '../domain/subjet-memo-detail';
import { UnauthorizedSubjectAccessError } from 'src/common/types/error/application-exceptions';
import { NotificationCategory } from 'src/module/notification/domain/enums/notification-category.enum';
import { UserEntity } from 'src/module/user/adapter/persistence/orm/entities/user.entity';

@Injectable()
export class SubjectMemoService {
  constructor(
    private readonly subjectMemoRepository: SubjectMemoRepository,
    private readonly subjectRepository: SubjectRepository,
    private readonly dateUtilService: DateUtilService,
    private readonly userTimetableRepository: UserTimetableRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async getMemosPaginated(
    userId: number,
    params: GetSubjectMemoRequest,
  ): Promise<PaginatedList<SubjectMemo>> {
    const { list, total } = await this.subjectMemoRepository.getMemosPaginated(
      userId,
      params,
    );

    return {
      list: SubjectMemoMapper.mapToDomain(list),
      total,
    };
  }

  async getTodayMemos(userId: number): Promise<SubjectMemoDetail[]> {
    const memos = await this.subjectMemoRepository.getMemosByPeriod(userId, {
      startDate: dayjs().startOf('date').toDate(),
      endDate: dayjs().endOf('date').toDate(),
    });

    return SubjectMemoDetailMapper.mapToDomain(memos);
  }

  async createOne(
    user: UserEntity,
    params: CreateSubjectMemoRequest,
  ): Promise<void> {
    const subjectId = await this.subjectRepository.findIdByNameOrFail(
      params.subjectName,
    );

    const [year, semester] = this.dateUtilService.getYearAndSemesterByDate(
      new Date(),
    );

    //  유저가 해당 학기에 듣는 과목인지 확인
    const isSubjectInUserTimetable =
      await this.userTimetableRepository.isSubjectInUserTimetable({
        userId: user.id,
        year,
        semester,
        subjectId,
      });

    if (!isSubjectInUserTimetable) {
      throw new UnauthorizedSubjectAccessError(params.subjectName);
    }

    const event = await this.subjectMemoRepository.insertOne({
      ...params,
      userId: user.id,
      subjectId,
      datetime: params.datetime,
    });

    this.notificationService.createOrScheduleNotification(
      user.profile.notificationsEnabled,
      user.id,
      NotificationCategory.SubjectMemo,
      {
        eventId: event.id,
        subjectName: params.subjectName,
      },
      params.datetime,
    );
  }

  async updateOne(
    userId: number,
    memoId: number,
    bodyParams: UpdateSubjectMemoRequest,
  ): Promise<void> {
    await this.subjectMemoRepository.findOneByIdAndUserIdOrFail(memoId, userId);

    await this.subjectMemoRepository.updateOne({
      ...bodyParams,
      id: memoId,
    });
  }

  async deleteOne(userId: number, memoId: number): Promise<void> {
    await this.subjectMemoRepository.findOneByIdAndUserIdOrFail(memoId, userId);

    await this.subjectMemoRepository.deleteOne({ id: memoId });
  }

  async deleteBySubjectId(userId: number, subjectId: number) {
    await this.subjectMemoRepository.deleteBySubject(userId, subjectId);
  }
}
