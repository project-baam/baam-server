import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { getEnvFilePath, validate } from './environment';
import { EnvironmentService } from './environment.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [getEnvFilePath()],
      isGlobal: true,
      cache: true,
      validate,
    }),
  ],
  providers: [EnvironmentService],
  exports: [EnvironmentService],
})
export class EnvironmentModule {}
