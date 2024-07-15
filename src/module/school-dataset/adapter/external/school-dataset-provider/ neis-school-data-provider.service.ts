import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

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
import { EnvironmentService } from 'src/module/environment/environment.service';
import { SchoolDatasetProvider } from './school-dataset-provider.interface';
import { ClassEntity } from '../../persistence/entities/class.entity';
import { SchoolEntity } from '../../persistence/entities/school.entity';
import { ClassInfo, ClassInfoRequest } from './dto/class-info.dto';
import { SchoolRepository } from 'src/module/school-dataset/application/port/school.repository';
import { HighSchoolType } from 'src/module/school-dataset/domain/value-objects/school-type';

@Injectable()
export class NeisSchoolDatasetProviderService extends SchoolDatasetProvider {
  private readonly apiKey: string;

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly httpService: HttpService,
    private readonly schoolRepository: SchoolRepository,
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

      if (!isDuplicate) {
        return {
          schoolId: school.id,
          grade: parseInt(e.GRADE),
          name: e.CLASS_NM,
        };
      }
    });

    return uniqueClasses.filter((e) => e !== undefined);
  }
}
