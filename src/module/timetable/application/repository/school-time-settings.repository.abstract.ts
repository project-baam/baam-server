import { SchoolTimeSettingsEntity } from '../../adapter/persistence/entities/school-time-settings.entity';

export abstract class SchoolTimeSettingsRepository {
  abstract save(
    dto: Pick<
      SchoolTimeSettingsEntity,
      'userId' | 'firstPeriodStart' | 'lunchTimeStart' | 'lunchTimeEnd'
    >,
  ): Promise<void>;

  abstract findByUserIdOrFail(
    userId: number,
  ): Promise<SchoolTimeSettingsEntity>;
}
