import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { NeisCategory, NeisSuccessCode, NeisUri } from './constants/neis';
import { Timetable, TimetableRequest } from './dto/timetable.dto';
import { ResponseDataDto } from './dto/success-response.dto';
import { ApiFailResponse } from './dto/fail-response.dto';
import { NeisError } from 'src/common/types/error/application-exceptions';
import { EnvironmentService } from '../environment/environment.service';
import { validateSync } from 'class-validator';
import { plainToInstance, ClassConstructor } from 'class-transformer';
import { LogProvider } from 'src/common/provider/log.provider';
import { SchoolInfo, SchoolInfoRequest } from './dto/school-info.dto';

@Injectable()
export class NeisServiceClient {
  private readonly apiKey: string;

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly httpService: HttpService,
  ) {
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
        NeisServiceClient.name,
      );

      // TODO: 리포팅(추후 필요하다고 판단되면 작성)
    }

    return data[category][1].row;
  }

  async getTimetables(dto: TimetableRequest): Promise<Timetable[]> {
    this.validate(TimetableRequest, dto);

    const data = await this.fetchData<Timetable>(NeisCategory.Timetable, {
      ...dto,
    });

    return data;
  }

  async getSchoolInfo(dto: SchoolInfoRequest): Promise<SchoolInfo[]> {
    this.validate(SchoolInfoRequest, dto);

    const data = await this.fetchData<SchoolInfo>(NeisCategory.SchoolInfo, {
      ...dto,
      SCHUL_KND_SC_NM: '고등학교',
    });

    return data;
  }
}
