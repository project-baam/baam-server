import {
  applyDecorators,
  Controller,
  ControllerOptions,
  UseFilters,
} from '@nestjs/common';

import { HttpExceptionFilter } from 'src/common/filters/http-exception/http-exception.filter';
import { InternalServerErrorFilter } from 'src/common/filters/http-exception/internal-server-exception.filter';
import { ParameterValidationExceptionFilter } from 'src/common/filters/http-exception/parameter-validator-exception.filter';

export function HttpController(): MethodDecorator & ClassDecorator;
export function HttpController(
  prefix: string | string[],
): MethodDecorator & ClassDecorator;
export function HttpController(
  options: ControllerOptions,
): MethodDecorator & ClassDecorator;

export function HttpController(param?: string | string[] | ControllerOptions) {
  // !! 필터는 역순으로 적용됨(params validation > http > 500)
  const exceptionFilters = [
    InternalServerErrorFilter,
    HttpExceptionFilter,
    ParameterValidationExceptionFilter,
  ];

  const decorators: (MethodDecorator | ClassDecorator)[] = [
    UseFilters(...exceptionFilters),
  ];
  decorators.push(Controller());

  if (!param) {
    decorators.push(Controller());
  } else if (typeof param === 'string' || Array.isArray(param)) {
    decorators.push(Controller(param));
  } else if (typeof param === 'object') {
    decorators.push(Controller(param));
  }

  return applyDecorators(...decorators);
}
