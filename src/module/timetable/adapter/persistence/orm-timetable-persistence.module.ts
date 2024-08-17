import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DefaultTimetableRepository } from '../../application/repository/default-timetable.repository.abstract';
import { DefaultTimetableEntity } from './entities/default-timetable.entity';
import { OrmDefaultTimetableRepository } from './repositories/default-timetable.repository';
import { OrmUserTimetableRepository } from './repositories/user-timetable.repository';
import { UserTimetableRepository } from '../../application/repository/user-timetable.repository.abstract';
import { UserTimetableEntity } from './entities/user-timetable.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DefaultTimetableEntity, UserTimetableEntity]),
  ],
  providers: [
    {
      provide: DefaultTimetableRepository,
      useClass: OrmDefaultTimetableRepository,
    },
    {
      provide: UserTimetableRepository,
      useClass: OrmUserTimetableRepository,
    },
  ],
  exports: [DefaultTimetableRepository, UserTimetableRepository],
})
export class OrmTimetablePersistenceModule {}
