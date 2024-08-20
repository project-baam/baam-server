import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

export function ApiFiles(
  files: { name: string; required: boolean }[],
  properties: Record<string, any> = {},
) {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          ...properties,
          ...files.reduce(
            (acc, file) => ({
              ...acc,
              [file.name]: {
                type: 'string',
                format: 'binary',
                nullable: !file.required,
              },
            }),
            {},
          ),
        },
        required: files
          .filter((file) => file.required)
          .map((file) => file.name),
      },
    }),
  );
}
