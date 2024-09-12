import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationDevicesEntity } from './entities/notification-devices.entity';
import { NotificationEntity } from './entities/notification.entity';
import { OrmNotificationDevicesRepository } from './repositories/notification-devices.repository';
import { NotificationDevicesRepository } from 'src/module/notification/application/port/notification-devices.repository.abstract';
import { NotificationRepository } from 'src/module/notification/application/port/notification.repository.abstract';
import { OrmNotificationRepository } from './repositories/notification.repository';
import { LogPushNotificationFailureEntity } from './entities/log-push-notification-failure.entity';
import { ScheduledNotificationRepository } from 'src/module/notification/application/port/scheduled-notification.repository.abstract';
import { OrmScheduledNotificationRepository } from './repositories/scheduled-notification.repository';
import { ScheduledNotificationEntity } from './entities/scheduled-notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationDevicesEntity,
      NotificationEntity,
      LogPushNotificationFailureEntity,
      ScheduledNotificationEntity,
    ]),
  ],
  providers: [
    {
      provide: NotificationDevicesRepository,
      useClass: OrmNotificationDevicesRepository,
    },
    {
      provide: NotificationRepository,
      useClass: OrmNotificationRepository,
    },
    {
      provide: ScheduledNotificationRepository,
      useClass: OrmScheduledNotificationRepository,
    },
  ],
  exports: [
    NotificationDevicesRepository,
    NotificationRepository,
    ScheduledNotificationRepository,
  ],
})
export class OrmNotificationPersistenceModule {}
