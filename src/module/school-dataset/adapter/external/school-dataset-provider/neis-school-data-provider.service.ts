import { DateUtilService } from 'src/module/util/date-util.service';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import dayjs, { Dayjs } from 'dayjs';

import {
  NEIS_MAX_PAGE_SIZE,
  NeisCategory,
  NeisSuccessCode,
  NeisUri,
} from './constants/neis';
import { Timetable, TimetableRequest } from './dto/timetable.dto';
import { ResponseDataDto } from './dto/success-response.dto';
import { ApiFailResponse } from './dto/fail-response.dto';
import { NeisError } from 'src/common/types/error/application-exceptions';
import { validateSync } from 'class-validator';
import { plainToInstance, ClassConstructor } from 'class-transformer';
import { LogProvider } from 'src/common/provider/log.provider';
import { SchoolInfo, SchoolInfoRequest } from './dto/school-info.dto';
import { EnvironmentService } from 'src/config/environment/environment.service';
import { SchoolDatasetProvider } from './school-dataset-provider.abstract';
import { ClassInfo, ClassInfoRequest } from './dto/class-info.dto';
import { SchoolRepository } from 'src/module/school-dataset/application/port/school.repository.abstract';
import { HighSchoolType } from 'src/module/school-dataset/domain/value-objects/school-type';
import { UpsertDefaultTimetable } from 'src/module/timetable/adapter/persistence/orm/types/default-timetable';
import { Semester } from 'src/module/school-dataset/domain/value-objects/semester';
import { Weekday } from 'src/module/timetable/domain/enums/weekday';
import { SubjectRepository } from 'src/module/school-dataset/application/port/subject.repository.abstract';
import { MealInfo, MealInfoRequest } from './dto/meal-info.dto';
import { toMealType } from './mapper/meal.mapper';
import { SchoolEvent } from 'src/module/school-dataset/domain/event';
import {
  SchoolSchedule,
  SchoolScheduleRequest,
} from './dto/school-schedule.dto';
import { SchoolEntity } from '../../persistence/orm/entities/school.entity';
import { ClassEntity } from '../../persistence/orm/entities/class.entity';
import { MealEntity } from '../../persistence/orm/entities/meal.entity';

@Injectable()
export class NeisSchoolDatasetProviderService extends SchoolDatasetProvider {
  private readonly apiKey: string;

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly httpService: HttpService,
    private readonly schoolRepository: SchoolRepository,
    private readonly subjectRepository: SubjectRepository,
    private readonly dateUtilService: DateUtilService,
  ) {
    super();
    this.apiKey = this.environmentService.get<string>('NEIS_API_KEY')!;
  }

  private validate<T extends object>(cls: ClassConstructor<T>, dto: T) {
    const errors = validateSync(plainToInstance(cls, dto));

    if (errors.length) {
      throw new NeisError(errors.toString());
    }
  }

  private getUrl(uri: string, queryParams: Record<string, string | number>) {
    return `${uri}?${Object.entries(
      Object.assign(queryParams, {
        KEY: this.apiKey,
      }),
    )
      .map(([key, value]) => `${key}=${value}`)
      .join('&')}`;
  }

  private async fetchData<T>(
    category: NeisCategory,
    queryParams: Record<string, string | number>,
  ): Promise<T[]> {
    const url = this.getUrl(NeisUri[category], queryParams);
    const { data } = await firstValueFrom(
      this.httpService.get<ResponseDataDto<T> | ApiFailResponse>(url),
    );

    // Api Failed
    if ('RESULT' in data) {
      if (data.RESULT.CODE === NeisSuccessCode.NoData) {
        return [];
      }
      throw new NeisError([data.RESULT.CODE, data.RESULT.MESSAGE].join(':'));
    }

    // 인증키 사용 제한 또는 참조만 가능한 경우 로그 남기기
    if (
      [NeisSuccessCode.KeyRestricted, NeisSuccessCode.ReferenceOnly].includes(
        data[category][0].head[1].RESULT.CODE,
      )
    ) {
      LogProvider.info(
        data[category][0].head[1].RESULT.MESSAGE,
        {
          url,
        },
        NeisSchoolDatasetProviderService.name,
      );

      // TODO: 리포팅(추후 필요하다고 판단되면 작성)
    }

    return data[category][1].row;
  }

  async requestNeisTimetables(dto: TimetableRequest): Promise<Timetable[]> {
    this.validate(TimetableRequest, dto);

    const data = await this.fetchData<Timetable>(NeisCategory.Timetable, {
      ...dto,
    });

    return data;
  }

  private async requestNeisSchoolInfo(
    dto: SchoolInfoRequest,
  ): Promise<SchoolInfo[]> {
    this.validate(SchoolInfoRequest, dto);

    const data = await this.fetchData<SchoolInfo>(NeisCategory.SchoolInfo, {
      ...dto,
      SCHUL_KND_SC_NM: '고등학교',
    });

    return data;
  }

  private async requestNeisClassInfo(
    dto: ClassInfoRequest,
  ): Promise<ClassInfo[]> {
    this.validate(ClassInfoRequest, dto);

    const data = await this.fetchData<ClassInfo>(NeisCategory.ClassInfo, {
      ...dto,
    });

    return data;
  }

  private async requestNeisMealInfo(dto: MealInfoRequest): Promise<MealInfo[]> {
    this.validate(MealInfoRequest, dto);

    const data = await this.fetchData<MealInfo>(NeisCategory.MealInfo, {
      ...dto,
    });

    return data;
  }

  private async requestNeisSchoolEventInfo(
    dto: SchoolScheduleRequest,
  ): Promise<SchoolSchedule[]> {
    this.validate(SchoolScheduleRequest, dto);

    const data = await this.fetchData<SchoolSchedule>(
      NeisCategory.SchoolSchedule,
      {
        ...dto,
      },
    );

    return data;
  }

  async fetchSchoolData(): Promise<Partial<SchoolEntity>[]> {
    let allSchools: SchoolInfo[] = [];
    let pageNumber = 1;
    let hasMoreData: boolean = true;

    while (hasMoreData) {
      const schools = await this.requestNeisSchoolInfo({
        Type: 'json',
        pIndex: pageNumber,
        pSize: NEIS_MAX_PAGE_SIZE,
      });
      allSchools = allSchools.concat(schools);

      if (schools.length < NEIS_MAX_PAGE_SIZE) {
        hasMoreData = false;
      } else {
        pageNumber++;
      }
    }

    return allSchools.map((school) => {
      return {
        name: school.SCHUL_NM,
        nameUs: school.ENG_SCHUL_NM,
        code: school.SD_SCHUL_CODE,
        officeCode: school.ATPT_OFCDC_SC_CODE,
        officeName: school.ATPT_OFCDC_SC_NM,
        postalCode: school.ORG_RDNZC,
        roadNameAddress: `${school.ORG_RDNMA} ${school.ORG_RDNDA}`,
        type: school.HS_SC_NM as HighSchoolType,
      };
    });
  }

  async fetchClassData(
    officeName: string,
    schoolName: string,
  ): Promise<Partial<ClassEntity>[] | null> {
    const school = await this.schoolRepository.findUniqueOne(
      officeName,
      schoolName,
    );

    if (!school) {
      return null;
    }

    const classes = await this.requestNeisClassInfo({
      Type: 'json',
      ATPT_OFCDC_SC_CODE: school.officeCode!,
      SD_SCHUL_CODE: school.code!,
    });

    const uniqueClasses = classes.map((e, i, arr) => {
      const isDuplicate =
        arr.findIndex(
          (x) => x.GRADE === e.GRADE && x.CLASS_NM === e.CLASS_NM,
        ) !== i;

      if (!isDuplicate && e.CLASS_NM[0] !== '0') {
        return {
          schoolId: school.id,
          grade: parseInt(e.GRADE),
          name: e.CLASS_NM,
        };
      }
    });

    return uniqueClasses.filter((e) => e !== undefined);
  }

  /**
   * 해당 년도/학기/학교/학급의 디폴트 시간표 추출
   */
  async fetchDefaultTimetable(
    year: number,
    semester: Semester,
    officeCode: string,
    schoolCode: string,
    grade: number,
    className: string,
  ): Promise<Omit<UpsertDefaultTimetable, 'classId'>[]> {
    let allTimetables: Timetable[] = [];
    let pageNumber = 1;
    let hasMoreData: boolean = true;

    // 학기에 따라 시작일과 종료일이 다름
    const [startDate] = this.dateUtilService.getThisSemesterRange();
    const from = dayjs(startDate).set('date', 16).format('YYYYMMDD');
    const to = dayjs(startDate)
      .add(1, 'month')
      .set('date', 16)
      .format('YYYYMMDD');

    while (hasMoreData) {
      const timetables = await this.requestNeisTimetables({
        Type: 'json',
        ATPT_OFCDC_SC_CODE: officeCode,
        SD_SCHUL_CODE: schoolCode,
        AY: year.toString(),
        SEM: semester.toString(),
        GRADE: grade.toString(),
        CLRM_NM: className,
        pIndex: pageNumber,
        pSize: NEIS_MAX_PAGE_SIZE,
        TI_FROM_YMD: from,
        TI_TO_YMD: to,
      });

      allTimetables = allTimetables.concat(timetables);

      if (timetables.length < NEIS_MAX_PAGE_SIZE) {
        hasMoreData = false;
      } else {
        pageNumber++;
      }
    }

    // 요일, 교시별로 과목 추출
    const allSubjectsOfDayAndPeriod = allTimetables.reduce(
      (acc, cur) => {
        const day = new Date(
          [year, cur.ALL_TI_YMD.slice(4, 6), cur.ALL_TI_YMD.slice(6, 8)].join(
            '-',
          ),
        ).getUTCDay();
        const index = acc.findIndex(
          (e) => e.day === day && e.period === cur.PERIO,
        );

        if (index >= 0) {
          acc[index].subjects.push(cur.ITRT_CNTNT);
        } else {
          acc.push({
            day,
            period: cur.PERIO,
            subjects: [cur.ITRT_CNTNT],
          });
        }

        return acc;
      },
      <{ day: Weekday; period: string; subjects: string[] }[]>[],
    );

    const defaultTimetables: Omit<UpsertDefaultTimetable, 'classId'>[] = [];

    for (const e of allSubjectsOfDayAndPeriod) {
      // subjects table 에 있는 과목만 추출
      const existingSubjectIds = await this.subjectRepository.findExistingIds(
        e.subjects,
      );
      // 가장 많이 나온 과목을 선택
      let subjectId: number;
      if (existingSubjectIds.length > 1) {
        subjectId = Array.from(new Set(existingSubjectIds))?.reduce(
          (prev, curr) =>
            existingSubjectIds.filter((el) => el === curr).length >
            existingSubjectIds.filter((el) => el === prev).length
              ? curr
              : prev,
        );
      } else {
        subjectId = existingSubjectIds[0];
      }

      if (subjectId !== undefined) {
        defaultTimetables.push({
          year,
          semester,
          day: e.day,
          period: parseInt(e.period),
          subjectId,
        });
      }
    }

    return defaultTimetables;
  }

  // TODO: 현재 fromDate, toDate 가 같은 경우만 사용하지만,
  // 추후에 필요할 경우 최대 페이지 사이즈 고려하여 배치로 처리할 수 있도록 수정F
  async fetchMealData(
    officeCode: string,
    schoolCode: string,
    fromDate: Dayjs,
    toDate: Dayjs,
  ): Promise<Pick<MealEntity, 'date' | 'type' | 'menu'>[]> {
    const meals = await this.requestNeisMealInfo({
      Type: 'json',
      ATPT_OFCDC_SC_CODE: officeCode,
      SD_SCHUL_CODE: schoolCode,
      MLSV_FROM_YMD: fromDate.format('YYYYMMDD'),
      MLSV_TO_YMD: toDate.format('YYYYMMDD'),
    });

    return meals.map((e) => {
      return {
        date: dayjs(e.MLSV_YMD).format('YYYY-MM-DD'),
        type: toMealType(e.MMEAL_SC_CODE),
        menu: e.DDISH_NM.split('<br/>').map((meal) =>
          meal
            .replace(/<br\/>/g, '') // <br/> 태그 제거
            .replace(/\(.*\)/g, '') // 괄호 전체 제거
            .trim(),
        ),
      };
    });
  }

  async fetchSchoolEvent(
    officeCode: string,
    schoolCode: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<SchoolEvent[]> {
    let allEvents: SchoolSchedule[] = [];
    let pageNumber = 1;
    let hasMoreData: boolean = true;

    while (hasMoreData) {
      const events = await this.requestNeisSchoolEventInfo({
        Type: 'json',
        ATPT_OFCDC_SC_CODE: officeCode,
        SD_SCHUL_CODE: schoolCode,
        AA_FROM_YMD: dayjs(fromDate).format('YYYYMMDD'),
        AA_TO_YMD: dayjs(toDate).format('YYYYMMDD'),
        pIndex: pageNumber,
        pSize: NEIS_MAX_PAGE_SIZE,
      });

      allEvents = allEvents.concat(events);

      if (events.length < NEIS_MAX_PAGE_SIZE) {
        hasMoreData = false;
      } else {
        pageNumber++;
      }
    }

    const gradePrefix = ['ONE', 'TW', 'THREE'] as const;
    const events: SchoolEvent[] = [];
    const specialEventSet = new Set([
      '개교기념일',
      '중간고사',
      '기말고사',
      '방학식',
      '입학식',
      '개학식',
      '대학수학능력시험',
      '졸업식',
    ]);
    const specialEventRegex = new RegExp(
      Array.from(specialEventSet)
        .map((event) => `(?=.*${event})`)
        .join(''),
      'i',
    );
    const isSpecialEvent = (event: SchoolSchedule) => {
      if (event.SBTR_DD_SC_NM === '공휴일') {
        return true;
      }
      if (event.SBTR_DD_SC_NM !== '휴얼입') {
        return false;
      }
      if (event.EVENT_NM === '해당없음') {
        return specialEventRegex.test(event.EVENT_CNTNT);
      }
    };

    for (const event of allEvents) {
      if (isSpecialEvent(event)) {
        const grades = gradePrefix.reduce<number[]>((acc, prefix, index) => {
          if (event[`${prefix}_GRADE_EVENT_YN`] === 'Y') {
            acc.push(index + 1);
          }
          return acc;
        }, []);

        grades.map((e) => {
          const newEvent = {
            date: dayjs(event.AA_YMD).format('YYYY-MM-DD'),
            title: event.EVENT_NM,
            content: event.EVENT_CNTNT,
            grade: e,
          };

          if (
            !events.some(
              (e) =>
                e.date === newEvent.date &&
                e.title === newEvent.title &&
                e.grade === newEvent.grade,
            )
          ) {
            events.push(newEvent);
          }
        });
      }
    }

    return events;
  }
}
