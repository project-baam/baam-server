import { forwardRef, Module } from '@nestjs/common';
import { NotificationController } from '../adapter/presenter/rest/notification.controller';
import { UserModule } from 'src/module/user/user.module';
import { NotificationService } from './notification.service';
import { OrmNotificationPersistenceModule } from '../adapter/persistence/orm/orm-notification-persistence.module';
import { PushNotificationService } from '../adapter/external/push-notification.abstract.service';
import { ExpoPushNotificationService } from '../adapter/external/push-notification.service';
import { NotificationSchedulerService } from './notification-scheduler.service';

@Module({
  imports: [forwardRef(() => UserModule), OrmNotificationPersistenceModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    {
      provide: PushNotificationService,
      useClass: ExpoPushNotificationService,
    },
    NotificationSchedulerService,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
