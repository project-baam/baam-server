import { Injectable, Logger } from '@nestjs/common';
import { FcmTokenValidator } from './fcm-token-validator.util';
import { FcmConfig } from './fcm.config';
import { PushNotificationService } from '../push-notification.abstract.service';
import { NotificationDevicesRepository } from 'src/module/notification/application/port/notification-devices.repository.abstract';
import { NotificationService } from 'src/module/notification/application/notification.service';
import { MessageRequestFormat } from '../dto/fcm.dto';
import { NotificationResult } from '../dto/notification-result.dto';
import { MalformedDevicePushTokenError } from 'src/common/types/error/application-exceptions';
import { PushNotificationConfig } from 'src/module/notification/domain/constants/push-notification-config.constant';
import { NotificationData } from 'src/module/notification/domain/notification';
import { NotificationCategory } from 'src/module/notification/domain/enums/notification-category.enum';

@Injectable()
export class FcmPushNotificationService implements PushNotificationService {
  constructor(
    private readonly fcmConfig: FcmConfig,
    private readonly notificationDevicesRepository: NotificationDevicesRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async checkTokenFormat(token: string): Promise<void> {
    if (!FcmTokenValidator.validate(token)) {
      throw new MalformedDevicePushTokenError();
    }
  }

  async sendNotifications(
    ...dtos: MessageRequestFormat[]
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];
    const messaging = this.fcmConfig.getMessaging();

    for (const dto of dtos) {
      try {
        if (!FcmTokenValidator.validate(dto.to)) {
          throw new MalformedDevicePushTokenError();
        }

        const response = await messaging.send({
          token: dto.to,
          notification: {
            title: dto.title,
            body: dto.body,
          },
          data: dto.data ? this.convertToStringObject(dto.data) : undefined,
        });

        results.push({ token: dto.to, status: 'success', messageId: response });
      } catch (error: any) {
        Logger.error(error);
        Logger.error(error.stack);
        const errorMessage =
          error instanceof MalformedDevicePushTokenError
            ? error.message
            : 'FCM send error';
        results.push({ token: dto.to, status: 'error', message: errorMessage });
        await this.handleNotificationFailure(
          dto.to,
          `${error}, ${error.stack}`,
        );
      }
    }

    return results;
  }

  convertToStringObject(obj: any): { [key: string]: string } {
    if (typeof obj === 'string') {
      try {
        obj = JSON.parse(obj);
      } catch (e) {
        return {};
      }
    }

    const result: { [key: string]: string } = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = String(obj[key]);
      }
    }

    return result;
  }

  private async handleNotificationFailure(
    token: string,
    error: string,
  ): Promise<void> {
    const userId =
      await this.notificationDevicesRepository.findUserIdByToken(token);

    await this.notificationDevicesRepository.insertFailureLog({
      deviceToken: token,
      errorMessage: error,
      failureTime: new Date(),
      userId,
    });

    const failureCount =
      await this.notificationDevicesRepository.getRecentFailureCount(
        token,
        PushNotificationConfig.FAILURE_CHECK_HOURS,
      );

    if (failureCount >= PushNotificationConfig.MAX_FAILURE_COUNT) {
      await this.notificationService.deactivateDeviceBySystem(token);
    }
  }

  async cleanupInactiveTokens(): Promise<void> {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    await this.notificationDevicesRepository.deleteOneByUpdatedAt(
      threeMonthsAgo,
    );
  }
}
