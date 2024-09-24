import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ApplicationException } from '../../common/types/error/application-exceptions.base';
import {
  IncompleteProfileError,
  InvalidAccessTokenError,
  MissingAuthTokenError,
} from '../../common/types/error/application-exceptions';
import { ResponseData } from '../../common/decorator/response-data.decorator';
import { ResponseList } from '../../common/decorator/response-list.decorators';

interface ApiDescriptionDto<TModel, TException> {
  tags?: string | string[];
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
  let description: string = dto.description ?? '';

  dto.exceptions = dto.exceptions ?? [];

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
      IncompleteProfileError,
    ];

    authenticationExceptions.forEach((exception) => {
      const e = new exception();
      description += `|**${e.getStatus()}**|**${e.code}**|${e.message}|\n`;
    });
  }

  const decorators: MethodDecorator[] = [
    ApiOperation({ summary: dto.summary, description }),
  ];

  if (typeof dto.tags === 'string' && dto.tags) {
    decorators.push(ApiTags(dto.tags));
  }

  if (Array.isArray(dto.tags) && dto.tags.length) {
    decorators.push(ApiTags(...dto.tags));
  }

  if (dto.dataResponse) {
    decorators.push(
      ApiExtraModels(dto.dataResponse.schema),
      ResponseData(dto.dataResponse.schema, dto.dataResponse.status),
    );
  }

  if (dto.listResponse) {
    decorators.push(
      ApiExtraModels(dto.listResponse.schema),
      ResponseList(dto.listResponse.schema, dto.listResponse.status),
    );
  }

  if (dto.auth) {
    decorators.push(ApiBearerAuth(dto.auth));
  }

  return applyDecorators(...decorators);
};
