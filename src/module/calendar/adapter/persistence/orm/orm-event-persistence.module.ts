import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventEntity } from './entities/event.entity';
import { EventRepository } from 'src/module/calendar/application/port/event.repository.abstract';
import { OrmEventRepository } from './repositories/event.repository';

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity])],
  providers: [
    {
      provide: EventRepository,
      useClass: OrmEventRepository,
    },
  ],
  exports: [EventRepository],
})
export class OrmEventPersistenceModule {}
