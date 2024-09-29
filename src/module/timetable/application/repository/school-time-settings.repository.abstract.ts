import { SchoolTimeSettingsEntity } from '../../adapter/persistence/orm/entities/school-time-settings.entity';

export abstract class SchoolTimeSettingsRepository {
  abstract find(): Promise<SchoolTimeSettingsEntity[]>;

  abstract save(
    dto: Pick<
      SchoolTimeSettingsEntity,
      'userId' | 'firstPeriodStart' | 'lunchTimeStart' | 'lunchTimeEnd'
    >,
  ): Promise<void>;

  abstract findByUserIdOrFail(
    userId: number,
  ): Promise<SchoolTimeSettingsEntity>;

  abstract findByUserId(
    userId: number,
  ): Promise<SchoolTimeSettingsEntity | null>;
}
