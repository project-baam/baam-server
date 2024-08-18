import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ApiBooleanResponse(
  status: HttpStatus = HttpStatus.OK,
  description?: string,
) {
  return applyDecorators(
    ApiResponse({
      status,
      description,
      schema: {
        type: 'boolean',
        example: true,
      },
    }),
  );
}
