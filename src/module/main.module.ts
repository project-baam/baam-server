import { Module } from '@nestjs/common';

import { EnvironmentModule } from './environment/environment.module';
import { IamModule } from './iam/iam.module';
import { UserModule } from './user/user.module';
import { UtilModule } from './util/util.module';
import { InMemoryModule } from './database/in-memory/in-memory.module';

@Module({
  imports: [
    EnvironmentModule,
    UtilModule,
    InMemoryModule,
    UserModule,
    IamModule,
  ],
})
export class MainModule {}
