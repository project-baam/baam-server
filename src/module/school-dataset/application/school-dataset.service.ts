import { Inject } from '@nestjs/common';

import { PaginatedList } from 'src/common/dto/response.dto';
import { GetSchoolsRequest } from '../adapter/presenter/rest/dto/school.dto';
import { SchoolMapper } from './mappers/school.mapper';
import { ClassResponse } from '../adapter/presenter/rest/dto/class.dto';
import { ClassRepository } from './port/class.repository';
import { SchoolRepository } from './port/school.repository';
import { School } from '../domain/school';
import { SchoolDatasetProvider } from '../adapter/external/school-dataset-provider/school-dataset-provider.interface';
import { SubjectRepository } from './port/subject.repository';
import {
  SubjectCategoriesRequest,
  SubjectCategoryResponse,
} from '../adapter/presenter/rest/dto/subject-categories.dto';
import { DefaultTimetableRepository } from 'src/module/timetable/application/repository/default-timetable.repository';
import { Semester } from 'src/module/school-dataset/domain/value-objects/semester';
import { SubjectsRequest } from '../adapter/presenter/rest/dto/subjects.dto';
import { getCurriculumVersion } from '../domain/value-objects/curriculum-version';
import { UpsertDefaultTimetable } from 'src/module/timetable/adapter/persistence/types/default-timetable';

export class SchoolDatasetService {
  constructor(
    @Inject(SchoolRepository)
    private readonly schoolRepository: SchoolRepository,

    @Inject(ClassRepository)
    private readonly classRepository: ClassRepository,

    @Inject(SchoolDatasetProvider)
    private readonly schoolDatasetProvider: SchoolDatasetProvider,

    @Inject(SubjectRepository)
    private readonly subjectRepository: SubjectRepository,

    @Inject(DefaultTimetableRepository)
    private readonly defaultTimetableRepository: DefaultTimetableRepository,
  ) {}

  // transactional
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
  ): Promise<void> {
    const allClasses = await this.classRepository.findAll();

    const defaultTimetables: UpsertDefaultTimetable[] = [];

    console.time('fetchDefaultTimetable');
    for (const cls of allClasses) {
      const defaultTimetables = (
        await this.schoolDatasetProvider.fetchDefaultTimetable(
          year,
          semester,
          cls.school.officeCode,
          cls.school.code,
          cls.grade,
          cls.name,
        )
      ).map((e) => Object.assign(e, { classId: cls.id }));

      if (defaultTimetables?.length) {
        defaultTimetables.push(...defaultTimetables);
      }
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
}
