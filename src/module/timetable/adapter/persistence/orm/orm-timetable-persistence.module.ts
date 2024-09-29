import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DefaultTimetableRepository } from '../../../application/repository/default-timetable.repository.abstract';
import { DefaultTimetableEntity } from './entities/default-timetable.entity';
import { OrmDefaultTimetableRepository } from './repositories/default-timetable.repository';
import { OrmUserTimetableRepository } from './repositories/user-timetable.repository';
import { UserTimetableRepository } from '../../../application/repository/user-timetable.repository.abstract';
import { UserTimetableEntity } from './entities/user-timetable.entity';
import { SchoolTimeSettingsEntity } from './entities/school-time-settings.entity';
import { SchoolTimeSettingsRepository } from '../../../application/repository/school-time-settings.repository.abstract';
import { OrmSchoolTimeSettingsRepository } from './repositories/school-time-settings.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DefaultTimetableEntity,
      UserTimetableEntity,
      SchoolTimeSettingsEntity,
    ]),
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
    {
      provide: SchoolTimeSettingsRepository,
      useClass: OrmSchoolTimeSettingsRepository,
    },
  ],
  exports: [
    DefaultTimetableRepository,
    UserTimetableRepository,
    SchoolTimeSettingsRepository,
  ],
})
export class OrmTimetablePersistenceModule {}
