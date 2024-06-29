import { NestFactory, Reflector } from '@nestjs/core';
import { MainModule } from './module/main.module';
import { EnvironmentService } from './module/environment/environment.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  HttpStatus,
  RequestMethod,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { json, urlencoded } from 'express';
import morganBody from 'morgan-body';
import helmet from 'helmet';
import { IncomingMessage, ServerResponse } from 'http';
import { LogProvider } from './provider/log.provider';
import { setupSwagger } from './docs/setup-swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(MainModule, {
    cors: true,
  });

  const environmentService: EnvironmentService =
    app.get<EnvironmentService>(EnvironmentService);

  const port = environmentService.get<number>('PORT');
  const isProduction = environmentService.isProduction();

  app.setGlobalPrefix(environmentService.get<string>('API_VERSION'), {
    exclude: [{ path: '/version', method: RequestMethod.GET }],
  });

  if (!isProduction) {
    setupSwagger(app);
  }

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.use(
    json({ limit: environmentService.get<string>('HTTP_BODY_SIZE_LIMIT') }),
  );

  app.use(
    urlencoded({
      extended: true,
      limit: environmentService.get<number>('HTTP_URL_LIMIT'),
    }),
  );

  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );

  morganBody(app.getHttpAdapter().getInstance(), {
    noColors: true,
    prettify: false,
    includeNewLine: false,
    logRequestBody: true,
    logAllReqHeader: true,
    skip(_req: IncomingMessage, res: ServerResponse) {
      if (_req.url === '/health') {
        return true;
      }
      return isProduction ? res.statusCode < 400 : false;
    },
    stream: {
      write: (message: string) => {
        LogProvider.info(message.replace('\n', ''), 'Http');
        return true;
      },
    },
  });
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
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
      exceptionFactory: (errors) => new BadRequestException(errors),
    }),
  );

  await app.listen(port);

  console.info(
    `Server ${environmentService.get<string>('ENV')} running on port ${port}`,
    'APP',
  );
}
bootstrap();
