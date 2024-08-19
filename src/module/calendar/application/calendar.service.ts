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

@Injectable()
export class CalendarService {
  constructor(
    private readonly schoolEventRepository: SchoolEventRepository,
    private readonly eventRepository: EventRepository,
    private readonly schoolDatasetService: SchoolDatasetService,
  ) {}

  /**
   * 회원가입시 캘린더에 학교 이벤트 세팅
   * (현재 날짜가 속한 년도의 모든 유저 학교 이벤트를 Neis API 를 통해 가져옴)
   * @param year 년도 (선택사항) 현재 날짜가 속한 년도로 설정
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
      await this.eventRepository.upsertMany(
        schoolEventsByYear.map((e) => {
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

      await this.eventRepository.upsertMany(data);
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

    const hasSchoolEvents = events.some(
      (event) => event.type === EventType.SCHOOL,
    );

    // TODO: 나이스에서 받아온 일정은 없지만, 유저가 임의로 학교 일정을 넣은 경우 ->
    // 이 유저에게는 나이스 학교 일정 세팅 불가(학교 일정 불러오기 등 별도 API 고려)
    if (!hasSchoolEvents) {
      await this.setUserSchoolEventsWithFallbackFetch(
        userId,
        schoolId,
        userGrade,
        year,
      );

      const updatedEvents = await this.eventRepository.getManyByMonth(
        userId,
        year,
        month,
      );
      return updatedEvents;
    }

    return events;
  }

  async createEvent(userId: number, params: CreateEventRequest) {
    await this.eventRepository.upsertMany([
      {
        userId,
        ...params,
        datetime: dayjs(params.datetime).toDate(),
      },
    ]);
  }

  async updateEvent(userId: number, params: UpdateEventRequest) {
    await this.eventRepository.findOneByIdOrFail(userId, params.id);
    await this.eventRepository.updateOne({
      ...params,
      userId,
      datetime: params?.datetime ? new Date(params?.datetime) : undefined,
    });
  }

  async deleteEvent(userId: number, id: number) {
    await this.eventRepository.findOneByIdOrFail(userId, id);
    await this.eventRepository.deleteOne(id);
  }
}
