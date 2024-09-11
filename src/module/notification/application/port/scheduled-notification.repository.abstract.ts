import { ScheduledNotificationEntity } from '../../adapter/persistence/orm/entities/scheduled-notification.entity';

export abstract class ScheduledNotificationRepository {
  abstract insertOne(
    dto: Omit<
      ScheduledNotificationEntity,
      'id' | 'createdAt' | 'updatedAt' | 'userDevice'
    >,
  ): Promise<ScheduledNotificationEntity>;

  abstract insertMany(
    dtos: Omit<
      ScheduledNotificationEntity,
      'id' | 'createdAt' | 'updatedAt' | 'userDevice'
    >[],
  ): Promise<ScheduledNotificationEntity[]>;
  abstract deleteOne(id: number): Promise<void>;
  abstract findScheduledBetween(
    from: Date,
    to: Date,
  ): Promise<ScheduledNotificationEntity[]>;
}
