import { Module } from '@nestjs/common';
import { OrmConfigService } from './orm.service';

@Module({
  providers: [OrmConfigService],
})
export class OrmConfigModule {}
