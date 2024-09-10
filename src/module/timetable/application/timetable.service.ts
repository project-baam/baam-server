import {
  memoizedGetCurrentSubject,
  optimizeTimetable,
} from './../../util/timetable-utils';
import { SchoolTimeSettingsRepository } from 'src/module/timetable/application/repository/school-time-settings.repository.abstract';
import { ClassRepository } from 'src/module/school-dataset/application/port/class.repository.abstract';
import { SubjectRepository } from 'src/module/school-dataset/application/port/subject.repository.abstract';
import { UserTimetableRepository } from 'src/module/timetable/application/repository/user-timetable.repository.abstract';
import { Injectable } from '@nestjs/common';
import { DefaultTimetableRepository } from './repository/default-timetable.repository.abstract';
import { DefaultTimetableEntity } from '../adapter/persistence/entities/default-timetable.entity';
import { DateUtilService } from 'src/module/util/date-util.service';
import { ContentNotFoundError } from 'src/common/types/error/application-exceptions';
import {
  DefaultTimetableRequest,
  EditOrAddTimetableRequest,
} from '../adapter/presenter/rest/dto/timetable.dto';
import { UserTimetableEntity } from '../adapter/persistence/entities/user-timetable.entity';
import { Weekday } from '../domain/enums/weekday';
import { Period } from '../domain/enums/period';
import { Semester } from 'src/module/school-dataset/domain/value-objects/semester';
import { SchoolDatasetService } from 'src/module/school-dataset/application/school-dataset.service';
import { SchoolRepository } from 'src/module/school-dataset/application/port/school.repository.abstract';
import { SchoolTimeSettingsUpsertRequest } from '../adapter/presenter/rest/dto/school-time-settings.dto';
import { precomputeTimes } from 'src/module/util/timetable-utils';

@Injectable()
export class TimetableService {
  private optimizedTimetables: Map<number, Map<string, string>> = new Map();
  private precomputedTimes: Map<number, ReturnType<typeof precomputeTimes>> =
    new Map();
  private currentYear: number;
  private currentSemester: Semester;

  constructor(
    private readonly defaultTimetableRepository: DefaultTimetableRepository,
    private readonly dateUtilService: DateUtilService,
    private readonly userTimetableRepository: UserTimetableRepository,
    private readonly subjectRepository: SubjectRepository,
    private readonly classRepository: ClassRepository,
    private readonly schoolRepository: SchoolRepository,
    private readonly schoolDatasetService: SchoolDatasetService,
    private readonly schoolTimeSettingsRepository: SchoolTimeSettingsRepository,
  ) {}

  async onModuleInit() {
    [this.currentYear, this.currentSemester] =
      this.dateUtilService.getYearAndSemesterByDate(new Date());
    await this.refreshAllUserTimetables();
  }

  private async refreshAllUserTimetables() {
    const allTimeSettings = await this.schoolTimeSettingsRepository.find();
    for (const setting of allTimeSettings) {
      await this.refreshUserTimetableCache(setting.userId);
    }
  }

  async refreshUserTimetableCache(userId: number) {
    const userTimeSettings =
      await this.schoolTimeSettingsRepository.findByUserId(userId);

    if (userTimeSettings) {
      this.precomputedTimes.set(
        userTimeSettings.userId,
        precomputeTimes(userTimeSettings),
      );
      const timetable = await this.userTimetableRepository.find({
        userId: userTimeSettings.userId,
        year: this.currentYear,
        semester: this.currentSemester,
      });
      this.optimizedTimetables.set(
        userTimeSettings.userId,
        optimizeTimetable(timetable),
      );
    }
  }

  getCurrentSubject(
    userId: number,
    currentTime: Date = new Date(),
  ): string | null {
    const optimizedTimetable = this.optimizedTimetables.get(userId);
    const precomputedTimes = this.precomputedTimes.get(userId);

    if (!optimizedTimetable || !precomputedTimes) {
      return null;
    }

    return memoizedGetCurrentSubject(
      optimizedTimetable,
      precomputedTimes,
      currentTime,
    );
  }

  async findSubjectsInUserTimetable(userId: number): Promise<string[]> {
    const [year, semester] = this.dateUtilService.getYearAndSemesterByDate(
      new Date(),
    );

    const subjects =
      await this.userTimetableRepository.findSubjectsInUserTimetable({
        userId,
        year,
        semester,
      });

    return subjects.map((e) => e.name);
  }

  async findDefaultClassTimetable(
    params: DefaultTimetableRequest,
  ): Promise<DefaultTimetableEntity[] | null> {
    const { year, semester, schoolId, className, grade } = params;
    const school = await this.schoolRepository.findByIdOrFail(schoolId);
    const classEntity = await this.classRepository.findByNameAndGrade(
      schoolId,
      className,
      grade,
    );
    if (!classEntity) {
      throw new ContentNotFoundError(
        'class',
        `${schoolId}-${school.name} ${className}`,
      );
    }

    const defaultTimetables =
      await this.defaultTimetableRepository.findDefaultClassTimetable(
        year,
        semester,
        classEntity.id,
      );

    return defaultTimetables;
  }

  /**
   * 회원가입시 기본 시간표를 설정(필요한 경우 Neis API 를 통해 가져옴)
   * 회원가입 시점
   * 1학기: 2월 1일 ~ 7월 31일
   * 2학기: 8월 1일 ~ 1월 31일
   */
  async setUserDefaultTimetableWithFallbackFetch(
    userId: number,
    classId: number,
    //TODO: user id 만 받고, class id 는 user 에서 가져올지?
  ): Promise<void> {
    const today = new Date();
    const [thisYear, semester] =
      this.dateUtilService.getYearAndSemesterByDate(today);

    const defaultTimetables =
      await this.defaultTimetableRepository.findDefaultClassTimetable(
        thisYear,
        semester,
        classId,
      );

    // 해당 학급에 대해 기본 시간표가 있는 경우
    if (defaultTimetables?.length) {
      await this.userTimetableRepository.upsert(
        defaultTimetables.map((e) => Object.assign(e, { userId })),
      );
    } else {
      // 해당 학급에 대해 기본 시간표가 없는 경우(유저가 최초 가입한 경우)
      await this.schoolDatasetService.createDefaultTimetable(
        thisYear,
        semester,
        classId,
      );

      const defaultTimetables =
        await this.defaultTimetableRepository.findDefaultClassTimetable(
          thisYear,
          semester,
          classId,
        );

      if (defaultTimetables?.length) {
        await this.userTimetableRepository.upsert(
          defaultTimetables.map((e) => Object.assign(e, { userId })),
        );
      }
    }
  }

  async findUserTimetable(
    userId: number,
    year: number,
    semester: Semester,
  ): Promise<UserTimetableEntity[] | null> {
    const userTimetables = await this.userTimetableRepository.find({
      userId,
      year,
      semester,
    });

    return userTimetables;
  }

  async editOrAddTimetable(userId: number, params: EditOrAddTimetableRequest) {
    const { year, semester, subjectName, day, period } = params;
    const subjectId =
      await this.subjectRepository.findIdByNameOrFail(subjectName);

    await this.userTimetableRepository.upsert({
      userId,
      year,
      semester,
      day,
      period,
      subjectId,
    });
    await this.refreshUserTimetableCache(userId);
  }

  async deleteTimetable(params: {
    userId: number;
    year: number;
    semester: Semester;
    day: Weekday;
    period: Period;
  }) {
    await this.userTimetableRepository.delete(params);
    await this.refreshUserTimetableCache(params.userId);
  }

  async checkTimeSettings(userId: number): Promise<void> {
    await this.schoolTimeSettingsRepository.findByUserIdOrFail(userId);
  }

  async upsertSchoolTimeSettings(
    userId: number,
    dto: SchoolTimeSettingsUpsertRequest,
  ) {
    await this.schoolTimeSettingsRepository.save({
      userId,
      ...dto,
    });
    await this.refreshUserTimetableCache(userId);
  }

  async updateCurrentYearAndSemester() {
    [this.currentYear, this.currentSemester] =
      this.dateUtilService.getYearAndSemesterByDate(new Date());
    await this.refreshAllUserTimetables();
  }
}
