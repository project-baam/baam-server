import { NotificationRepository } from 'src/module/notification/application/port/notification.repository.abstract';
import { ReportProvider } from 'src/common/provider/report.provider';
import { PushNotificationService } from '../adapter/external/push-notification.abstract.service';
import { RegisterDeviceTokenDto } from '../adapter/presenter/rest/dto/register-device-token.dto';
import { NotificationCategory } from '../domain/enums/notification-category.enum';
import { NotificationDevicesRepository } from './port/notification-devices.repository.abstract';
import { NotificationAlreadyRead } from 'src/common/types/error/application-exceptions';
import {
  FriendRequestNotificationDto,
  NotificationDto,
  SubjectMemoNotificationDto,
} from './dto/notification.dto';
import { ScheduledNotificationMapper } from './mapper/scheduled-notification.mapper';
import { ScheduledNotificationRepository } from './port/scheduled-notification.repository.abstract';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Notification } from 'src/module/notification/domain/notification';
import { GetNotificationRequest } from '../adapter/presenter/rest/dto/get-notification.dto';
import { PaginatedList } from 'src/common/dto/response.dto';
import { NotificationMapper } from './mapper/notification.mapper';
import dayjs from 'dayjs';
import { MessageRequestFormat } from '../adapter/external/dto/fcm.dto';

@Injectable()
export class NotificationService {
  constructor(
    private readonly devicesRepository: NotificationDevicesRepository,
    @Inject(forwardRef(() => PushNotificationService))
    private readonly pushNotificationService: PushNotificationService,
    private readonly scheduledNotificationRepository: ScheduledNotificationRepository,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async registerDeviceToken(
    userId: number,
    params: RegisterDeviceTokenDto,
  ): Promise<void> {
    const { deviceToken, deviceType, osType } = params;
    await this.devicesRepository.createOrUpdate({
      userId,
      deviceToken,
      deviceType,
      osType,
      isActive: true,
    });
  }

  /**
   * 유저 디바이스 토큰 비활성화(로그아웃시 호출)
   */
  async deactivateDeviceByUser(
    userId: number,
    deviceToken: string,
  ): Promise<void> {
    const device = await this.devicesRepository.findOneByTokenOrFail({
      userId,
      deviceToken,
    });
    await this.devicesRepository.update(device.id, {
      isActive: false,
    });
  }

  /**
   * 시스템에 의한 디바이스 토큰 비활성화(로그로 서버에서 판단 후 호출)
   */
  async deactivateDeviceBySystem(deviceToken: string): Promise<void> {
    const device = await this.devicesRepository.findOneByToken(deviceToken);
    if (device) {
      await this.devicesRepository.update(device.id, {
        isActive: false,
      });
    }
  }

  async createOrScheduleNotification(
    notificationEnabled: boolean,
    userId: number,
    category: NotificationCategory,
    dto: NotificationDto,
    scheduledAt?: Date,
  ) {
    try {
      const deviceTokens = (
        await this.devicesRepository.findActiveDevices(userId)
      ).map((e) => e.deviceToken);

      const entity = ScheduledNotificationMapper.toPersistence(
        userId,
        deviceTokens,
        category,
        dto,
        scheduledAt ?? new Date(),
      );

      // 유저의 알림 설정이 꺼져있으면 알림 발송하지 않고, DB에만 저장
      if (!notificationEnabled) {
        await this.notificationRepository.insertOne({
          userId: userId,
          category: category,
          title: entity.notificationTitle,
          body: entity.notificationBody,
          message: entity.notificationMessage,
          sentAt: new Date(),
        });
        return;
      }

      if (deviceTokens.length) {
        // 미래 시간이면 예약된 알림으로 저장
        if (scheduledAt && dayjs(scheduledAt).isAfter(dayjs())) {
          await this.scheduledNotificationRepository.insertOne(entity);
        } else {
          // 현재 시간이거나 과거 시간이면 즉시 발송
          const sendResults =
            await this.pushNotificationService.sendNotifications(
              ...MessageRequestFormat.from(entity),
            );

          const successfulResults = sendResults.filter(
            (result) => result.status === 'success',
          );
          const failedResults = sendResults.filter(
            (result) => result.status === 'error',
          );

          // 하나의 디바이스라도 발송 성공하면 notification table 에 insert
          if (successfulResults.length > 0) {
            await this.notificationRepository.insertOne({
              userId: userId,
              category: category,
              title: entity.notificationTitle,
              body: entity.notificationBody,
              message: entity.notificationMessage,
              sentAt: new Date(),
            });
          }

          // 모두 실패한 경우, 리포팅(재시도는 우선 생략) TODO:
          if (failedResults.length === sendResults.length) {
            ReportProvider.error(Error(`알림 발송 실패`), {
              parameter: {
                userId,
                category,
                scheduledAt,
              },
              sendResults,
            });
          }
        }
      } else {
        Logger.debug('등록된 디바이스 토큰이 없으므로 알림 발송 불가', {
          userId,
          category,
          id:
            (dto as SubjectMemoNotificationDto)['eventId'] ??
            (dto as FriendRequestNotificationDto)['requestId'],
          deviceTokens,
        });
      }
    } catch (e: any) {
      ReportProvider.error(
        e,
        {
          userId,
          category,
          id:
            (dto as SubjectMemoNotificationDto)['eventId'] ??
            (dto as FriendRequestNotificationDto)['requestId'],
        },
        NotificationService.name,
      );
    }
  }

  async markAsRead(userId: number, id: number): Promise<void> {
    const notification = await this.notificationRepository.findByIdOrFail(
      userId,
      id,
    );
    if (notification.isRead) {
      throw new NotificationAlreadyRead();
    }
    await this.notificationRepository.update(id, { isRead: true });
  }

  async findNotifications(
    userId: number,
    params: GetNotificationRequest,
  ): Promise<PaginatedList<Notification>> {
    const { list, total } = await this.notificationRepository.findPaginated(
      userId,
      params,
    );

    return { list: NotificationMapper.mapToDomain(list), total };
  }
}
