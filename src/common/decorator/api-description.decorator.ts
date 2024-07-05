import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiOperation } from '@nestjs/swagger';

import { ApplicationException } from '../types/error/application-exceptions.base';
import {
  InvalidAccessTokenError,
  MissingAuthTokenError,
} from '../types/error/application-exceptions';
import { ResponseData } from './response-data.decorator';
import { ResponseList } from './response-list.decorators';

interface ApiDescriptionDto<TModel, TException> {
  summary: string;
  description?: string;
  auth?: string;
  dataResponse?: {
    status: HttpStatus;
    schema: TModel;
  };
  listResponse?: {
    status: HttpStatus;
    schema: TModel;
  };
  exceptions?: (new () => TException)[];
}

export const ApiDescription = <
  TModel extends Type<unknown>,
  TException extends ApplicationException,
>(
  dto: ApiDescriptionDto<TModel, TException>,
) => {
  // Swagger description 필드: API description + 예외 응답 코드 테이블
  let description: string = dto.description || '';

  dto.exceptions = dto.exceptions || [];

  // Add table header
  if (dto.auth || (!dto.auth && dto.exceptions.length)) {
    description +=
      '\n|http status|error code|error message|\n\
    |---|---|---------|\n';
  }

  if (dto.exceptions?.length) {
    dto.exceptions.forEach((exception) => {
      const e = new exception();
      description += `|**${e.getStatus()}**|**${e.code}**|${e.message}|\n`;
    });
  }

  if (dto.auth) {
    const authenticationExceptions = [
      MissingAuthTokenError,
      InvalidAccessTokenError,
    ];

    authenticationExceptions.forEach((exception) => {
      const e = new exception();
      description += `|**${e.getStatus()}**|**${e.code}**|${e.message}|\n`;
    });
  }

  const decorators: MethodDecorator[] = [
    ApiOperation({ summary: dto.summary, description }),
  ];

  if (dto.dataResponse) {
    decorators.push(
      ApiExtraModels(dto.dataResponse.schema),
      ResponseData(dto.dataResponse.schema),
    );
  }

  if (dto.listResponse) {
    decorators.push(
      ApiExtraModels(dto.listResponse.schema),
      ResponseList(dto.listResponse.schema),
    );
  }

  if (dto.auth) {
    decorators.push(ApiBearerAuth(dto.auth));
  }

  return applyDecorators(...decorators);
};
