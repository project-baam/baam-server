import { NestFactory, Reflector } from '@nestjs/core';
import { MainModule } from './module/main.module';
import { EnvironmentService } from './config/environment/environment.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { json, NextFunction, urlencoded } from 'express';
import morganBody from 'morgan-body';
import helmet from 'helmet';
import { IncomingMessage, ServerResponse } from 'http';
import { v4 as uuidV4 } from 'uuid';

import { LogProvider } from './common/provider/log.provider';
import { setupSwagger } from './docs/setup-swagger';
import { initializeTransactionalContext } from 'typeorm-transactional';
import dayjs from 'dayjs';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { commonValidationPipeOptions } from './config/validation-pipe.config';

async function bootstrap() {
  initializeTransactionalContext();

  process.env.TZ = 'Asia/Seoul';
  dayjs.extend((_option, dayjsClass) => {
    const oldFormat = dayjsClass.prototype.format;
    dayjsClass.prototype.format = function (formatString) {
      return oldFormat.bind(this)(formatString ?? 'YYYY-MM-DD HH:mm:ss');
    };
  });

  const app = await NestFactory.create<NestExpressApplication>(MainModule, {
    cors: true,
  });
  app.useWebSocketAdapter(new IoAdapter(app));
  // app.enableCors({
  //   origin: true,
  //   methods: [
  //     'GET',
  //     'POST',
  //     'PUT',
  //     'DELETE',
  //     'PATCH',
  //     'OPTIONS',
  //     'HEAD',
  //     'CONNECT',
  //     'TRACE',
  //     'WS',
  //     'WSS',
  //     'WEBSOCKET',
  //   ],
  //   credentials: true,
  // });

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    credentials: true,
  });

  app.set('trust proxy', true);

  const environmentService: EnvironmentService =
    app.get<EnvironmentService>(EnvironmentService);

  const port = environmentService.get<number>('PORT')!;
  const isProduction = environmentService.isProduction();

  app.use((_req: Request, _res: Response, next: NextFunction) =>
    LogProvider.scope(uuidV4(), next),
  );

  if (!isProduction) {
    setupSwagger(app);
  }

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

  // HTTP 에서만 적용됨
  app.useGlobalPipes(new ValidationPipe(commonValidationPipeOptions));

  await app.listen(port);

  console.info(
    `Server ${environmentService.get<string>('ENV')} running on port ${port}`,
    'APP',
  );
}
bootstrap();
