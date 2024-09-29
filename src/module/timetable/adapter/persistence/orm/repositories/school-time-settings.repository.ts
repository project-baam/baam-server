import { InjectRepository } from '@nestjs/typeorm';
import { SchoolTimeSettingsEntity } from '../entities/school-time-settings.entity';
import { SchoolTimeSettingsRepository } from 'src/module/timetable/application/repository/school-time-settings.repository.abstract';
import { Repository } from 'typeorm';
import { SchoolTimeNotSetError } from 'src/common/types/error/application-exceptions';

export class OrmSchoolTimeSettingsRepository
  implements SchoolTimeSettingsRepository
{
  constructor(
    @InjectRepository(SchoolTimeSettingsEntity)
    private readonly schoolTimeSettingsRepository: Repository<SchoolTimeSettingsEntity>,
  ) {}

  find(): Promise<SchoolTimeSettingsEntity[]> {
    return this.schoolTimeSettingsRepository.find();
  }

  findByUserId(userId: number): Promise<SchoolTimeSettingsEntity | null> {
    return this.schoolTimeSettingsRepository.findOneBy({ userId });
  }

  async save(
    dto: Pick<
      SchoolTimeSettingsEntity,
      'userId' | 'firstPeriodStart' | 'lunchTimeStart' | 'lunchTimeEnd'
    >,
  ): Promise<void> {
    await this.schoolTimeSettingsRepository.upsert(dto, ['userId']);
  }

  async findByUserIdOrFail(userId: number): Promise<SchoolTimeSettingsEntity> {
    const schoolTimeSettings =
      await this.schoolTimeSettingsRepository.findOneBy({ userId });

    if (!schoolTimeSettings) {
      throw new SchoolTimeNotSetError();
    }
    return schoolTimeSettings;
  }
}
