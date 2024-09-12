import { LogPushNotificationFailureEntity } from '../../adapter/persistence/orm/entities/log-push-notification-failure.entity';
import { NotificationDevicesEntity } from '../../adapter/persistence/orm/entities/notification-devices.entity';

export abstract class NotificationDevicesRepository {
  abstract findUserIdByToken(deviceToken: string): Promise<number | null>;
  abstract deleteOneByUpdatedAt(lessThan: Date): Promise<void>;
  abstract findOneByTokenOrFail(
    dto:
      | Pick<NotificationDevicesEntity, 'userId' | 'deviceToken'>
      | Pick<NotificationDevicesEntity, 'deviceToken'>,
  ): Promise<NotificationDevicesEntity>;

  abstract findOneByToken(
    token: string,
  ): Promise<NotificationDevicesEntity | null>;

  abstract createOrUpdate(
    dto: Pick<
      NotificationDevicesEntity,
      'userId' | 'deviceToken' | 'deviceType' | 'osType' | 'isActive'
    >,
  ): Promise<void>;

  abstract update(
    id: number,
    dto: Partial<NotificationDevicesEntity>,
  ): Promise<void>;

  abstract findActiveDevices(
    userId: number,
  ): Promise<NotificationDevicesEntity[]>;

  abstract insertFailureLog(
    dto: Pick<
      LogPushNotificationFailureEntity,
      'deviceToken' | 'userId' | 'errorMessage' | 'failureTime'
    >,
  ): Promise<void>;

  abstract getRecentFailureCount(
    deviceToken: string,
    hours: number,
  ): Promise<number>;
}
