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
import { SubjectsRequest } from '../adapter/presenter/rest/dto/subjects.dto';
import { getCurriculumVersion } from '../domain/value-objects/curriculum-version';

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
