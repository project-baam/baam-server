import { NotificationService } from 'src/module/notification/application/notification.service';
import Expo, { ExpoPushTicket } from 'expo-server-sdk';
import { PushNotificationService } from './push-notification.abstract.service';
import { MessageRequestFormat } from './dto/expo.dto';
import { Injectable } from '@nestjs/common';
import { MalformedExpoPushTokenError } from 'src/common/types/error/application-exceptions';
import { NotificationDevicesRepository } from '../../application/port/notification-devices.repository.abstract';
import { PushNotificationConfig } from '../../domain/constants/push-notification-config.constant';
import { NotificationResult } from './dto/notification-result.dto';

@Injectable()
export class ExpoPushNotificationService implements PushNotificationService {
  private readonly expo: Expo;

  constructor(
    private readonly notificationDevicesRepository: NotificationDevicesRepository,
    private readonly notificationService: NotificationService,
  ) {
    this.expo = new Expo();
  }

  checkTokenFormat(token: string) {
    if (!Expo.isExpoPushToken(token)) {
      throw new MalformedExpoPushTokenError();
    }
  }

  private async filterAndHandleMalformedTokens(
    dtos: MessageRequestFormat[],
  ): Promise<MessageRequestFormat[]> {
    const validDtos: MessageRequestFormat[] = [];
    const invalidTokens: string[] = [];

    for (const dto of dtos) {
      if (Expo.isExpoPushToken(dto.to)) {
        validDtos.push(dto);
      } else {
        invalidTokens.push(dto.to);
      }
    }

    this.handleMalformedTokens(invalidTokens);

    return validDtos;
  }

  /**
   * 포맷이 잘못된 토큰은 즉시 비활성화
   */
  private async handleMalformedTokens(tokens: string[]): Promise<void> {
    for (const token of tokens) {
      await this.notificationService.deactivateDeviceBySystem(token);
    }
  }

  async sendNotifications(
    ...dtos: MessageRequestFormat[]
  ): Promise<NotificationResult[]> {
    // 유효한 토큰만 필터링
    const validDtos = await this.filterAndHandleMalformedTokens(dtos);

    const results: NotificationResult[] = [];

    try {
      const tickets: ExpoPushTicket[] =
        await this.expo.sendPushNotificationsAsync(validDtos);
      results.push(
        ...tickets.map((ticket, index) =>
          this.processTicket(ticket, validDtos[index].to),
        ),
      );

      for (const result of results) {
        if (result.status === 'error') {
          await this.handleNotificationFailure(
            result.token,
            result.message || 'Unknown error',
          );
        }
      }
    } catch (error: any) {
      results.push(
        ...validDtos.map((dto) => ({
          token: dto.to,
          status: 'error' as const,
          message: error.message,
        })),
      );
      await Promise.all(
        results.map((result) =>
          this.handleNotificationFailure(
            result.token,
            result.message || 'Unknown error',
          ),
        ),
      );
    }

    return results;
  }

  private processTicket(
    ticket: ExpoPushTicket,
    token: string,
  ): NotificationResult {
    if (ticket.status === 'ok') {
      return { token, status: 'success' };
    } else {
      return {
        token,
        status: 'error',
        message: ticket.details?.error,
      };
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
