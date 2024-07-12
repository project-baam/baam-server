import { Module } from '@nestjs/common';

import { EnvironmentModule } from './environment/environment.module';
import { IamModule } from './iam/iam.module';
import { UserModule } from './user/user.module';
import { UtilModule } from './util/util.module';
import { InMemoryModule } from './database/in-memory/in-memory.module';
import { HttpModule } from '@nestjs/axios';
import { NeisServiceModule } from './neis-service/neis-service.module';

@Module({
  imports: [
    EnvironmentModule,
    UtilModule,
    HttpModule,
    InMemoryModule,
    UserModule,
    IamModule,
    NeisServiceModule,
  ],
})
export class MainModule {}
