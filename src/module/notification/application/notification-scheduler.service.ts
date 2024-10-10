import { EnvironmentService } from './../../../config/environment/environment.service';
import { Injectable, Logger } from '@nestjs/common';
import { ScheduledNotificationRepository } from './port/scheduled-notification.repository.abstract';
import { NotificationRepository } from './port/notification.repository.abstract';
import { PushNotificationService } from '../adapter/external/push-notification.abstract.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScheduledNotificationEntity } from '../adapter/persistence/orm/entities/scheduled-notification.entity';
import dayjs from 'dayjs';
import { createConcurrencyLimiter } from 'src/module/util/concurrency-util.service';
import { ReportProvider } from 'src/common/provider/report.provider';
import { MessageRequestFormat } from '../adapter/external/dto/fcm.dto';
import { FCM_LIMITS } from '../adapter/external/constants/fcm.constants';

@Injectable()
export class NotificationSchedulerService {
  private runWithLimit: <T>(fn: () => Promise<T>) => Promise<T>;

  constructor(
    private readonly scheduledNotificationRepository: ScheduledNotificationRepository,
    private readonly notificationRepository: NotificationRepository,
    private readonly pushNotificationService: PushNotificationService,
    private readonly environmentService: EnvironmentService,
  ) {
    this.runWithLimit = createConcurrencyLimiter(
      FCM_LIMITS.REQUESTS_PER_SECOND,
    );
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledNotifications() {
    if (this.environmentService.isLocal()) {
      return;
    }

    const now = dayjs().startOf('minute');
    const endOfMinute = now.add(1, 'minute');

    const scheduledNotifications =
      await this.scheduledNotificationRepository.findScheduledBetween(
        now.toDate(),
        endOfMinute.toDate(),
      );

    await Promise.all(
      scheduledNotifications.map((notification) =>
        this.runWithLimit(() => this.processNotification(notification)),
      ),
    );
  }

  // 같은 알림에 대해 유저의 모든 디바이스에 발송
  private async processNotification(notification: ScheduledNotificationEntity) {
    try {
      const results = await this.pushNotificationService.sendNotifications(
        ...MessageRequestFormat.from(notification),
      );

      const successfulResults = results.filter(
        (result) => result.status === 'success',
      );
      const failedResults = results.filter(
        (result) => result.status === 'error',
      );

      // 동일 알림에 대해 하나의 디바이스라도 성공한 경우, 스케줄된 알림 삭제 + notification 테이블에 저장

      if (successfulResults.length > 0) {
        await this.notificationRepository.insertOne({
          userId: notification.userId,
          category: notification.category,
          title: notification.notificationTitle,
          body: notification.notificationBody,
          message: notification.notificationMessage,
          sentAt: new Date(),
        });
        await this.scheduledNotificationRepository.deleteOne(notification.id);
      }

      // 모두 실패한 경우, schedulNotification 테이블에 그냥 유지 TODO: 재시도는 우선 생략
      if (failedResults.length === results.length) {
        ReportProvider.error(Error(`예약 알림 발송 실패`), {
          notification,
          results,
        });
      }

      Logger.debug(
        `예약 알림 발송 결과 [${notification.category}] ${results.length} 중 ${successfulResults.length} 성공`,
        {
          notification,
          results,
        },
      );
    } catch (error: any) {
      ReportProvider.error(
        error,
        {
          notification,
        },
        NotificationSchedulerService.name,
      );
    }
  }
}
