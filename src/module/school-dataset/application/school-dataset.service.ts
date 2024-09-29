import { Inject } from '@nestjs/common';

import { PaginatedList } from 'src/common/dto/response.dto';
import { GetSchoolsRequest } from '../adapter/presenter/rest/dto/school.dto';
import { SchoolMapper } from './mappers/school.mapper';
import { ClassResponse } from '../adapter/presenter/rest/dto/class.dto';
import { ClassRepository } from './port/class.repository.abstract';
import { SchoolRepository } from './port/school.repository.abstract';
import { School } from '../domain/school';
import { SchoolDatasetProvider } from '../adapter/external/school-dataset-provider/school-dataset-provider.abstract';
import {
  SubjectCategoriesRequest,
  SubjectCategoryResponse,
} from '../adapter/presenter/rest/dto/subject-categories.dto';
import { Semester } from 'src/module/school-dataset/domain/value-objects/semester';
import { SubjectsRequest } from '../adapter/presenter/rest/dto/subjects.dto';
import { getCurriculumVersion } from '../domain/value-objects/curriculum-version';
import { UpsertDefaultTimetable } from 'src/module/timetable/adapter/persistence/orm/types/default-timetable';
import { Dayjs } from 'dayjs';
import { MealRepository } from './port/meal.repository.abstract';
import { Meal } from '../domain/meal';
import { MealMapper } from './mappers/meal.mapper';
import { SubjectRepository } from './port/subject.repository.abstract';
import { DefaultTimetableRepository } from 'src/module/timetable/application/repository/default-timetable.repository.abstract';
import { SchoolEvent } from '../domain/event';
import { SchoolEventRepository } from './port/school-event.repository.abstract';
import { SchoolEventMapper } from './mappers/school-event.mapper';
import { Transactional } from 'typeorm-transactional';
import { MealEntity } from '../adapter/persistence/orm/entities/meal.entity';

export class SchoolDatasetService {
  constructor(
    @Inject(SchoolRepository)
    private readonly schoolRepository: SchoolRepository,

    @Inject(ClassRepository)
    private readonly classRepository: ClassRepository,

    @Inject(MealRepository)
    private readonly mealRepository: MealRepository,

    @Inject(SchoolDatasetProvider)
    private readonly schoolDatasetProvider: SchoolDatasetProvider,

    @Inject(SubjectRepository)
    private readonly subjectRepository: SubjectRepository,

    @Inject(DefaultTimetableRepository)
    private readonly defaultTimetableRepository: DefaultTimetableRepository,

    @Inject(SchoolEventRepository)
    private readonly schoolEventRepository: SchoolEventRepository,
  ) {}

  @Transactional()
  async initializeSchoolDataset(): Promise<void> {
    const schools = await this.schoolDatasetProvider.fetchSchoolData();
    await this.schoolRepository.upsertMany(schools);

    for (const school of schools) {
      const classes = await this.schoolDatasetProvider.fetchClassData(
        school.officeName!,
        school.name!,
      );

      if (classes?.length) {
        await this.classRepository.upsertMany(classes);
      }
    }
  }

  /**
   * 나이스 Open API 로 학년도/학기/학교/학급별 디폴트 시간표 추출
   * 디폴트 시간표 테이블에 데이터 삽입
   */
  async createDefaultTimetable(
    year: number,
    semester: Semester,
    classId: number,
  ): Promise<void> {
    const cls = await this.classRepository.findByIdOrFail(classId);

    const defaultTimetables: UpsertDefaultTimetable[] = [];

    console.time('fetchDefaultTimetable');
    const timetables = (
      await this.schoolDatasetProvider.fetchDefaultTimetable(
        year,
        semester,
        cls.school.officeCode,
        cls.school.code,
        cls.grade,
        cls.name,
      )
    ).map((e) => Object.assign(e, { classId: cls.id }));

    if (timetables?.length) {
      defaultTimetables.push(...timetables);
    }

    console.timeEnd('fetchDefaultTimetable');
    console.log(defaultTimetables.length);

    await this.defaultTimetableRepository.upsertMany(defaultTimetables);
  }

  async getSchools(params: GetSchoolsRequest): Promise<PaginatedList<School>> {
    const { list, total } =
      await this.schoolRepository.getSchoolsPaginated(params);

    return {
      list: list.map((e) => SchoolMapper.toDomain(e)),
      total,
    };
  }

  async findClassesBySchoolId(schoolId: number): Promise<ClassResponse[]> {
    await this.schoolRepository.findByIdOrFail(schoolId);

    const classes = await this.classRepository.findBySchoolId(schoolId);

    const classesGroupByGrade: ClassResponse[] =
      classes?.reduce(
        (acc, cur) => {
          const index = acc.findIndex((e) => e.grade === cur.grade);

          if (index >= 0) {
            acc[index].names.push(cur.name);
          } else {
            acc.push({ grade: cur.grade, names: [cur.name] });
          }

          return acc;
        },
        <ClassResponse[]>[],
      ) ?? [];

    return classesGroupByGrade;
  }

  async getSubjectCategories(
    params: SubjectCategoriesRequest,
  ): Promise<PaginatedList<SubjectCategoryResponse>> {
    return this.subjectRepository.findCategories(
      getCurriculumVersion(params.year, params.grade),
      params.count,
      params.page,
    );
  }

  async getSubjects(params: SubjectsRequest): Promise<PaginatedList<string>> {
    return this.subjectRepository.findSubjects(
      getCurriculumVersion(params.year, params.grade),
      params.count,
      params.page,
      { category: params?.category, search: params?.search },
    );
  }

  /**
   * 급식 정보 조회
   * 없을 경우 Neis API 를 통해 가져옴
   */
  async getMealBySchoolIdAndDateWithFallbackFetch(
    schoolId: number,
    date: Dayjs,
  ): Promise<Meal[]> {
    const meals = await this.mealRepository.findBySchoolIdAndDate(
      schoolId,
      date,
    );

    if (meals?.length) {
      return meals.map((e) => MealMapper.toDomain(e));
    } else {
      const school = await this.schoolRepository.findByIdOrFail(schoolId);
      const mealData = await this.schoolDatasetProvider.fetchMealData(
        school.officeCode,
        school.code,
        date,
        date,
      );
      await this.mealRepository.upsertMany(
        mealData.map((e) => MealMapper.toPersistence(e, schoolId)),
      );

      return (mealData as MealEntity[]).map((e) => MealMapper.toDomain(e));
    }
  }

  /**
   * 학사일정 조회
   * 없을 경우 Neis API 를 통해 가져옴
   */
  async getSchoolEventBySchoolIdAndDateWithFallbackFetch(
    schoolId: number,
    fromDate: Date,
    toDate: Date,
  ): Promise<SchoolEvent[]> {
    const events = await this.schoolEventRepository.findBySchoolAndDate(
      schoolId,
      fromDate,
      toDate,
    );

    // TODO: 일부만 없을 경우 고민 필요
    if (events?.length) {
      return events.map((e) => SchoolEventMapper.toDomain(e));
    } else {
      const school = await this.schoolRepository.findByIdOrFail(schoolId);
      const events = await this.schoolDatasetProvider.fetchSchoolEvent(
        school.officeCode,
        school.code,
        fromDate,
        toDate,
      );
      await this.schoolEventRepository.upsertMany(
        events.map((e) => SchoolEventMapper.toPersistence(e, schoolId)),
      );

      const updated = await this.schoolEventRepository.findBySchoolAndDate(
        schoolId,
        fromDate,
        toDate,
      );

      return updated.map((e) => SchoolEventMapper.toDomain(e));
    }
  }
}
