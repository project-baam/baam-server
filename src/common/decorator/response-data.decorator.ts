import { HttpStatus, Type } from '@nestjs/common';
import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

export const ResponseData = <TModel extends Type<unknown>>(
  model: TModel,
  status: HttpStatus = HttpStatus.OK,
) =>
  applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status,
      schema: {
        type: 'object',
        $ref: getSchemaPath(model),
      },
    }),
  );
