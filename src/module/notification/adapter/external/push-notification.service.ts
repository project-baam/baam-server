import { NotificationService } from 'src/module/notification/application/notification.service';
import Expo from 'expo-server-sdk';
import { PushNotificationService } from './push-notification.abstract.service';
import { MessageRequestFormat } from './dto/expo.dto';
import { Injectable } from '@nestjs/common';
import { InvalidExpoPushTokenError } from 'src/common/types/error/application-exceptions';
import { NotificationDevicesRepository } from '../../application/port/notification-devices.repository.abstract';
import { PushNotificationConfig } from '../../domain/constants/push-notification-config.constant';

@Injectable()
export class ExpoPushNotificationService implements PushNotificationService {
  constructor(
    private readonly expo: Expo,
    private readonly notificationDevicesRepository: NotificationDevicesRepository,
    private readonly notificationService: NotificationService,
  ) {
    this.expo = new Expo();
  }

  async validateToken(token: string): Promise<boolean> {
    return Expo.isExpoPushToken(token);
  }

  async sendNotification(dto: MessageRequestFormat): Promise<boolean> {
    if (!Expo.isExpoPushToken(dto.to)) {
      throw new InvalidExpoPushTokenError();
    }

    try {
      const result = await this.expo.sendPushNotificationsAsync([
        {
          to: dto.to,
          body: dto?.body,
          title: dto?.title,
          data: dto?.data,
        },
      ]);

      // Expo SDK는 배열로 결과를 반환
      if (result[0].status === 'error') {
        await this.handleNotificationFailure(dto.to, result[0].message);

        return false;
      }

      return true;
    } catch (error: any) {
      await this.handleNotificationFailure(error, error.message);

      return false;
    }
  }

  private async handleNotificationFailure(
    token: string,
    errorMessage: string,
  ): Promise<void> {
    const userId =
      await this.notificationDevicesRepository.findUserIdByToken(token);

    await this.notificationDevicesRepository.insertFailureLog({
      deviceToken: token,
      errorMessage,
      failureTime: new Date(),
      userId,
    });

    const failureCount =
      await this.notificationDevicesRepository.getRecentFailureCount(
        token,
        PushNotificationConfig.FAILURE_CHECK_HOURS,
      );

    if (failureCount >= PushNotificationConfig.MAX_FAILURE_COUNT) {
      // 예: 24시간 내 5번 이상 실패
      await this.notificationService.deactivateDeviceBySystem(token);
    }
  }

  // TODO: 일정 기간 이상 사용되지 않은 토큰 삭제(지금은 호출하는 곳이 없음)
  async cleanupInactiveTokens(): Promise<void> {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    await this.notificationDevicesRepository.deleteOneByUpdatedAt(
      threeMonthsAgo,
    );
  }
}
