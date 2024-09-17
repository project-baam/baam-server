import {
  applyDecorators,
  Controller,
  ControllerOptions,
  UseFilters,
} from '@nestjs/common';
import { InternalServerErrorFilter } from '../filters/rest/internal-server-exception.filter';
import { RestExceptionFilter } from '../filters/rest/rest-exception.filter';
import { ParameterValidationExceptionFilter } from '../filters/rest/parameter-validator-exception.filter';

export function RestApi(): MethodDecorator & ClassDecorator;
export function RestApi(
  prefix: string | string[],
): MethodDecorator & ClassDecorator;
export function RestApi(
  options: ControllerOptions,
): MethodDecorator & ClassDecorator;

export function RestApi(param?: string | string[] | ControllerOptions) {
  // !! 필터는 역순으로 적용됨(params validation > http > 500)
  const exceptionFilters = [
    InternalServerErrorFilter,
    RestExceptionFilter,
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
