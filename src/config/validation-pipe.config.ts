import {
  ValidationPipeOptions,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';

export const commonValidationPipeOptions: ValidationPipeOptions = {
  whitelist: true,
  errorHttpStatusCode: HttpStatus.BAD_REQUEST,
  transform: true,
  forbidNonWhitelisted: true,
  forbidUnknownValues: true,
  disableErrorMessages: false,
  validationError: {
    target: true,
    value: true,
  },
  transformOptions: {
    // excludeExtraneousValues: true,
  },
  exceptionFactory: (errors) => new BadRequestException(errors),
};
