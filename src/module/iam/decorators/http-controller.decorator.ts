import {
  applyDecorators,
  Controller,
  ControllerOptions,
  UseFilters,
} from '@nestjs/common';

import { HttpExceptionFilter } from 'src/common/filters/http-exception/http-exception.filter';
import { InternalServerErrorFilter } from 'src/common/filters/http-exception/internal-server-exception.filter';
import { ParameterValidationExceptionFilter } from 'src/common/filters/http-exception/parameter-validator-exception.filter';

export function HttpController(prefixOrOption?: string | ControllerOptions) {
  // !! 필터는 역순으로 적용됨(params validation > http > 500)
  const exceptionFilters = [
    InternalServerErrorFilter,
    HttpExceptionFilter,
    ParameterValidationExceptionFilter,
  ];

  if (typeof prefixOrOption === 'string') {
    return applyDecorators(
      UseFilters(...exceptionFilters),
      Controller(prefixOrOption),
    );
  } else {
    return applyDecorators(
      UseFilters(...exceptionFilters),
      Controller(prefixOrOption),
    );
  }
}
