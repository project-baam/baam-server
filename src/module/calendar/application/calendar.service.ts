import { UserTimetableRepository } from 'src/module/timetable/application/repository/user-timetable.repository.abstract';
import { DateUtilService } from 'src/module/util/date-util.service';
import { SubjectRepository } from 'src/module/school-dataset/application/port/subject.repository.abstract';
import { TimetableService } from 'src/module/timetable/application/timetable.service';
import dayjs from 'dayjs';
import { SchoolDatasetService } from './../../school-dataset/application/school-dataset.service';
import { Injectable } from '@nestjs/common';
import { SchoolEventRepository } from 'src/module/school-dataset/application/port/school-event.repository.abstract';
import { EventRepository } from './port/event.repository.abstract';
import { EventEntity } from '../adapter/persistence/orm/entities/event.entity';
import {
  CreateEventRequest,
  UpdateEventRequest,
} from '../adapter/presenter/rest/dto/calendar.dto';
import { EventType } from '../domain/event';
import { UserGrade } from 'src/module/school-dataset/domain/value-objects/grade';
import {
  MissingRequiredFieldsError,
  UnauthorizedSubjectAccessError,
  UnexpectedFieldsError,
} from 'src/common/types/error/application-exceptions';
import { NotificationService } from 'src/module/notification/application/notification.service';
import { NotificationCategory } from 'src/module/notification/domain/enums/notification-category.enum';
import { UserEntity } from 'src/module/user/adapter/persistence/orm/entities/user.entity';

@Injectable()
export class CalendarService {
  constructor(
    private readonly schoolEventRepository: SchoolEventRepository,
    private readonly eventRepository: EventRepository,
    private readonly schoolDatasetService: SchoolDatasetService,
    private readonly timetableService: TimetableService,
    private readonly subjectRepository: SubjectRepository,
    private readonly dateUtilService: DateUtilService,
    private readonly userTimetableRepository: UserTimetableRepository,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * 회원가입시 캘린더에 학교 이벤트 세팅 or 유저가 학교 정보 변경 시 캘린더에 학교 이벤트 세팅 <- TODO: 이 경우에 기존 유저가 세팅해둔 학교 이벤트를 모두 삭제해야할지
   * (현재 날짜가 속한 년도의 모든 유저 학교 이벤트를 Neis API 를 통해 가져옴)
   * @param year 년도 (선택사항) 현재 날짜가 속한 년도로 설정
   *
   *
   */
  async setUserSchoolEventsWithFallbackFetch(
    userId: number,
    schoolId: number,
    userGrade: UserGrade,
    year?: number,
  ) {
    let fromDate: Date;
    let toDate: Date;
    if (!year) {
      const today = new Date();
      fromDate = dayjs(today).startOf('year').toDate();
      toDate = dayjs(today).endOf('year').toDate();
    } else {
      fromDate = dayjs(new Date(year, 0, 1))
        .startOf('year')
        .toDate();
      toDate = dayjs(new Date(year, 11, 31))
        .endOf('year')
        .toDate();
    }

    const schoolEventsByYear =
      await this.schoolEventRepository.findBySchoolAndDate(
        schoolId,
        fromDate,
        toDate,
      );

    if (schoolEventsByYear.length) {
      await this.eventRepository.insertMany(
        schoolEventsByYear
          .filter((e) => e.grade === userGrade)
          .map((e) => {
            return {
              userId,
              datetime: e.date,
              title: e.title,
              type: EventType.SCHOOL,
            };
          }),
      );
    } else {
      const events =
        await this.schoolDatasetService.getSchoolEventBySchoolIdAndDateWithFallbackFetch(
          schoolId,
          fromDate,
          toDate,
        );
      const data1 = events.filter((e) => e.grade === userGrade);
      const data = data1.map((e) => {
        return {
          userId,
          datetime: new Date(e.date),
          title: e.title,
          type: EventType.SCHOOL,
        };
      });

      await this.eventRepository.insertMany(data);
    }
  }

  async getMonthEvents(
    userId: number,
    userGrade: UserGrade,
    schoolId: number,
    year: number,
    month: number,
  ): Promise<EventEntity[]> {
    const events = await this.eventRepository.getManyByMonth(
      userId,
      year,
      month,
    );

    return events;
  }

  async createEvent(user: UserEntity, params: CreateEventRequest) {
    let subjectId: number;

    if (params.type === EventType.CLASS) {
      subjectId = await this.subjectRepository.findIdByNameOrFail(
        params.subjectName!,
      );

      const [year, semester] = this.dateUtilService.getYearAndSemesterByDate(
        new Date(),
      );

      const isSubjectInUserTimetable =
        await this.userTimetableRepository.isSubjectInUserTimetable({
          userId: user.id,
          year,
          semester,
          subjectId,
        });

      if (!isSubjectInUserTimetable) {
        throw new UnauthorizedSubjectAccessError(params.subjectName!);
      }
    } else {
      // 다른 타입일 경우 subjectName 있으면 invalid
      if (params.subjectName) {
        throw new UnexpectedFieldsError(
          ['subjectName'],
          `CLASS 타입이 아닐 경우 subjectName 필드 불필요`,
        );
      }
    }

    const event = await this.eventRepository.insertOne({
      userId: user.id,
      ...params,
      subjectId: params.type === EventType.CLASS ? subjectId! : null,
      datetime: dayjs(params.datetime).toDate(),
    });

    this.notificationService.createOrScheduleNotification(
      user.profile.notificationsEnabled,
      user.id,
      params.type === EventType.CLASS
        ? NotificationCategory.SubjectMemo
        : NotificationCategory.Calendar,
      params.type === EventType.CLASS
        ? {
            eventId: event.id,
            subjectName: params.subjectName!,
          }
        : {
            eventId: event.id,
            eventTitle: params.title,
          },
      dayjs(params.datetime).toDate(),
    );

    return event;
  }

  async updateEvent(userId: number, params: UpdateEventRequest) {
    const event = await this.eventRepository.findOneByIdOrFail(
      userId,
      params.id,
    );
    // CLASS 타입으로 변경 시, subjectName 필수 + 해당 과목이 유저 시간표에 있는지 확인
    if (params.type === EventType.CLASS) {
      if (!params.subjectName) {
        throw new MissingRequiredFieldsError(
          ['subjectName'],
          `다른 타입에서 CLASS 타입으로 변경 시, subjectName 필수`,
        );
      }
      const subjectId = await this.subjectRepository.findIdByNameOrFail(
        params.subjectName!,
      );

      const [year, semester] = this.dateUtilService.getYearAndSemesterByDate(
        new Date(),
      );

      const isSubjectInUserTimetable =
        await this.userTimetableRepository.isSubjectInUserTimetable({
          userId,
          year,
          semester,
          subjectId,
        });

      if (!isSubjectInUserTimetable) {
        throw new UnauthorizedSubjectAccessError(params.subjectName!);
      }

      delete params.subjectName;

      await this.eventRepository.updateOne({
        ...params,
        userId,
        datetime: params?.datetime ? new Date(params?.datetime) : undefined,
        subjectId,
      });
    }

    // 다른 타입으로 변경시 subjectName 있으면 invalid
    if (params.type !== EventType.CLASS) {
      if (params.subjectName) {
        throw new UnexpectedFieldsError(
          ['subjectName'],
          `CLASS 타입이 아닐 경우 subjectName 필드 불필요`,
        );
      }

      delete params.subjectName;

      await this.eventRepository.updateOne({
        ...params,
        userId,
        datetime: params?.datetime ? new Date(params?.datetime) : undefined,
        subjectId: null, // 다른 타입에서 class 타입으로 변경시 subjectId 초기화
      });
    }
  }

  async deleteEvent(userId: number, id: number) {
    await this.eventRepository.findOneByIdOrFail(userId, id);
    await this.eventRepository.deleteOne(id);
  }
}
