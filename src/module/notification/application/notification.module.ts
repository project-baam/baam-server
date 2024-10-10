import { forwardRef, Module } from '@nestjs/common';
import { NotificationController } from '../adapter/presenter/rest/notification.controller';
import { UserModule } from 'src/module/user/user.module';
import { NotificationService } from './notification.service';
import { OrmNotificationPersistenceModule } from '../adapter/persistence/orm/orm-notification-persistence.module';
import { PushNotificationService } from '../adapter/external/push-notification.abstract.service';
import { NotificationSchedulerService } from './notification-scheduler.service';
import { FcmPushNotificationService } from '../adapter/external/fcm/fcm-push-notification.service';
import { FcmConfig } from '../adapter/external/fcm/fcm.config';

@Module({
  imports: [forwardRef(() => UserModule), OrmNotificationPersistenceModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    {
      provide: PushNotificationService,
      useClass: FcmPushNotificationService,
    },
    NotificationSchedulerService,
    FcmConfig,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
