import { TimetableCacheStorage } from './../adapter/persistence/in-memory/timetable-cache.storage';
import {
  memoizedGetCurrentSubject,
  memoizedGetCurrentSubjectWithTimes,
  precomputeTimes,
} from 'src/module/util/timetable-utils';
import { optimizeTimetable } from './../../util/timetable-utils';
import { ChatService } from 'src/module/chat/application/chat.service';

import { SchoolTimeSettingsRepository } from 'src/module/timetable/application/repository/school-time-settings.repository.abstract';
import { ClassRepository } from 'src/module/school-dataset/application/port/class.repository.abstract';
import { SubjectRepository } from 'src/module/school-dataset/application/port/subject.repository.abstract';
import { UserTimetableRepository } from 'src/module/timetable/application/repository/user-timetable.repository.abstract';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { DefaultTimetableRepository } from './repository/default-timetable.repository.abstract';
import { DefaultTimetableEntity } from '../adapter/persistence/orm/entities/default-timetable.entity';
import { DateUtilService } from 'src/module/util/date-util.service';
import { ContentNotFoundError } from 'src/common/types/error/application-exceptions';
import {
  DefaultTimetableRequest,
  EditOrAddTimetableRequest,
} from '../adapter/presenter/rest/dto/timetable.dto';
import { UserTimetableEntity } from '../adapter/persistence/orm/entities/user-timetable.entity';
import { Weekday } from '../domain/enums/weekday';
import { Period } from '../domain/enums/period';
import { Semester } from 'src/module/school-dataset/domain/value-objects/semester';
import { SchoolDatasetService } from 'src/module/school-dataset/application/school-dataset.service';
import { SchoolRepository } from 'src/module/school-dataset/application/port/school.repository.abstract';
import { SchoolTimeSettingsUpsertRequest } from '../adapter/presenter/rest/dto/school-time-settings.dto';
import { SchoolTimeSettingsEntity } from '../adapter/persistence/orm/entities/school-time-settings.entity';
import { ReportProvider } from 'src/common/provider/report.provider';
import { SubjectMemoService } from 'src/module/subject-memo/application/subject-memo.service';
import { SubjectEntity } from 'src/module/school-dataset/adapter/persistence/orm/entities/subject.entity';
import { CurrentSubjectInfo } from '../adapter/presenter/rest/dto/current-subject-info.dto';

@Injectable()
export class TimetableService {
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
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly subjectMemoSerivce: SubjectMemoService,
    private readonly timetableCacheStorage: TimetableCacheStorage,
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
      await this.timetableCacheStorage.setPrecomputedTimes(
        userId,
        precomputeTimes(userTimeSettings),
      );

      const timetable = await this.userTimetableRepository.find({
        userId: userTimeSettings.userId,
        year: this.currentYear,
        semester: this.currentSemester,
      });

      await this.timetableCacheStorage.setOptimizedTimetable(
        userId,
        optimizeTimetable(timetable),
      );
    }
  }

  async getCurrentSubject(
    userId: number,
    currentTime: Date = new Date(),
  ): Promise<string | null> {
    const [optimizedTimetable, precomputedTimes] = await Promise.all([
      this.timetableCacheStorage.getOptimizedTimetable(userId),
      this.timetableCacheStorage.getPrecomputedTimes(userId),
    ]);

    if (!optimizedTimetable || !precomputedTimes) {
      return null;
    }

    return memoizedGetCurrentSubject(
      optimizedTimetable,
      precomputedTimes,
      currentTime,
    );
  }

  async getCurrentSubjectWithTimes(
    userId: number,
    currentTime: Date = new Date(),
  ): Promise<CurrentSubjectInfo> {
    const [optimizedTimetable, precomputedTimes] = await Promise.all([
      this.timetableCacheStorage.getOptimizedTimetable(userId),
      this.timetableCacheStorage.getPrecomputedTimes(userId),
    ]);

    if (!optimizedTimetable || !precomputedTimes) {
      return { subject: null, startTime: null, endTime: null };
    }

    return memoizedGetCurrentSubjectWithTimes(
      optimizedTimetable,
      precomputedTimes,
      currentTime,
    );
  }

  async findSubjectsInUserTimetable(userId: number): Promise<string[]> {
    const [year, semester] = this.dateUtilService.getYearAndSemesterByDate(
      new Date(),
    );

    return this.userTimetableRepository.findSubjectsInUserTimetable({
      userId,
      year,
      semester,
    });
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
   * 회원가입시 기본 시간표를 설정(필요한 경우 Neis API 를 통해 가져옴) or
   * 유저가 학급 정보 변경 시 기본 시간표를 설정 <- TODO: 이 경우에 기존 유저가 세팅해둔 시간표를 모두 삭제해야할지 (<- 삭제하면 관련 과목별 메모, 캘린더, 채팅방 모두 영향)
   * 회원가입 시점
   * 1학기: 2월 1일 ~ 7월 31일
   * 2학기: 8월 1일 ~ 1월 31일
   */
  async setUserDefaultTimetableWithFallbackFetch(
    userId: number,
    classId: number,
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
  ): Promise<UserTimetableEntity[]> {
    const userTimetables = await this.userTimetableRepository.find({
      userId,
      year,
      semester,
    });

    return userTimetables;
  }

  async getNonCommonSubjectsFromUserTimetable(
    userId: number,
    year: number = this.currentYear,
    semester: Semester = this.currentSemester,
  ): Promise<UserTimetableEntity[]> {
    return this.userTimetableRepository.findNotInCommonSubjects({
      userId,
      year,
      semester,
    });
  }

  async editOrAddTimetable(userId: number, params: EditOrAddTimetableRequest) {
    const { year, semester, subjectName, day, period } = params;
    const newSubject =
      await this.subjectRepository.findByNameOrFail(subjectName);

    // 해당 시간의 기존 과목
    const oldSubject =
      await this.userTimetableRepository.findSubjectByDayAndPeriod({
        userId,
        year,
        semester,
        day,
        period,
      });

    await this.userTimetableRepository.upsert({
      userId,
      year,
      semester,
      day,
      period,
      subjectId: newSubject.id,
    });
    await this.refreshUserTimetableCache(userId);

    // 채팅방 변경 처리
    if (!oldSubject) {
      // 새로운 과목 추가
      this.handleChatRoomChange(userId, year, semester, newSubject);
    } else if (oldSubject.id !== newSubject.id) {
      // 기존 과목이 다른 과목으로 변경됨(**두 과목에 대한 분반 변경 필요**)
      this.handleChatRoomChange(userId, year, semester, oldSubject);
      this.handleChatRoomChange(userId, year, semester, newSubject);
    }
    // 같은 과목으로 '변경'된 경우, 필요한 작업 없음
  }

  async deleteTimetable(params: {
    userId: number;
    year: number;
    semester: Semester;
    day: Weekday;
    period: Period;
  }) {
    const subject =
      await this.userTimetableRepository.findSubjectByDayAndPeriod(params);

    if (subject) {
      await this.userTimetableRepository.delete(params);
      this.handleChatRoomChange(
        params.userId,
        params.year,
        params.semester,
        subject,
      );
      this.handleSubjectDeleted(
        params.userId,
        params.year,
        params.semester,
        subject.id,
      );
    }

    await this.refreshUserTimetableCache(params.userId);
  }

  /**
   * 해당 과목의 모든 수업이 삭제되었을 경우, 과목 메모 삭제
   * (과목메모 = event table 의 class type)
   */
  private async handleSubjectDeleted(
    userId: number,
    year: number,
    semester: Semester,
    subjectId: number,
  ) {
    const timetable =
      await this.userTimetableRepository.findUserTimetableBySubject({
        userId,
        year,
        semester,
        subjectId,
      });

    if (!timetable.length) {
      this.subjectMemoSerivce.deleteBySubjectId(userId, subjectId);
    }
  }

  private handleChatRoomChange(
    userId: number,
    year: number,
    semester: Semester,
    subject: SubjectEntity,
  ) {
    this.chatService
      .handleTimetableChange(userId, year, semester, subject)
      .catch((error) => {
        Logger.error(error.message, error.stack, TimetableService.name);
        ReportProvider.error(
          error,
          {
            title: '유저 시간표 변경 반영해서 채팅방 변경 실패',
            userId,
            year,
            semester,
          },
          TimetableService.name,
        );
      });
  }

  async getTimeSettings(userId: number): Promise<SchoolTimeSettingsEntity> {
    return this.schoolTimeSettingsRepository.findByUserIdOrFail(userId);
  }

  async findTimeSettings(
    userId: number,
  ): Promise<SchoolTimeSettingsEntity | null> {
    return this.schoolTimeSettingsRepository.findByUserId(userId);
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
