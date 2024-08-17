import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { name, version } from '../../package.json';
import { AuthorizationToken } from './constant/authorization-token';
import { ErrorCode } from 'src/common/constants/error-codes';
import { customCss } from './constant/custom-css';

export function setupSwagger(app: INestApplication): void {
  const options = new DocumentBuilder()
    .setTitle(name)
    .setVersion(version)
    .setDescription(
      `\n\
      API 공통\n\n\n\
        * 잘못된 요청 파라미터 - 400 Bad Request\n\
        {\n\
          "code": ${ErrorCode.InvalidParameter},\n\
          "message": "",\n\
        }\n\n\
        * 서버 에러 - 500 Internal Server Error \n\
        {\n\
          "code": ${ErrorCode.InternalServerError},\n\
          "message": "",\n\
        }\n\
        `,
    )
    .addBearerAuth(
      {
        name: 'Authorization',
        in: 'header',
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'User Authorization Token',
      },
      AuthorizationToken.BearerUserToken,
    )
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('documentation', app, document, {
    customCss,
    customSiteTitle: 'Baam API Documentation',
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
}
