import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';

import { NotificationDevicesRepository } from 'src/module/notification/application/port/notification-devices.repository.abstract';
import { NotificationDevicesEntity } from '../entities/notification-devices.entity';
import { ContentNotFoundError } from 'src/common/types/error/application-exceptions';
import { LogPushNotificationFailureEntity } from '../entities/log-push-notification-failure.entity';

@Injectable()
export class OrmNotificationDevicesRepository
  implements NotificationDevicesRepository
{
  constructor(
    @InjectRepository(NotificationDevicesEntity)
    private readonly devicesRepository: Repository<NotificationDevicesEntity>,

    @InjectRepository(LogPushNotificationFailureEntity)
    private readonly failureLogRepository: Repository<LogPushNotificationFailureEntity>,
  ) {}

  async deleteOneByUpdatedAt(lessThan: Date): Promise<void> {
    await this.devicesRepository.delete({
      isActive: false,
      updatedAt: LessThan(lessThan),
    });
  }

  async findUserIdByToken(deviceToken: string): Promise<number | null> {
    return this.devicesRepository.findOneBy({ deviceToken }).then((device) => {
      return device?.userId ?? null;
    });
  }

  async findOneByTokenOrFail(
    dto:
      | Pick<NotificationDevicesEntity, 'userId' | 'deviceToken'>
      | Pick<NotificationDevicesEntity, 'deviceToken'>,
  ): Promise<NotificationDevicesEntity> {
    const device = await this.devicesRepository.findOneBy(dto);

    if (!device) {
      throw new ContentNotFoundError('deviceToken', dto.deviceToken);
    }

    return device;
  }

  async findOneByToken(token: string) {
    return this.devicesRepository.findOneBy({ deviceToken: token });
  }

  async createOrUpdate(
    dto: Pick<
      NotificationDevicesEntity,
      'userId' | 'deviceToken' | 'deviceType' | 'osType' | 'isActive'
    >,
  ): Promise<void> {
    await this.devicesRepository.upsert(dto, ['userId', 'deviceToken']);
  }

  async update(
    id: number,
    dto: Partial<NotificationDevicesEntity>,
  ): Promise<void> {
    await this.devicesRepository.update(id, dto);
  }

  findActiveDevices(userId: number): Promise<NotificationDevicesEntity[]> {
    return this.devicesRepository.find({
      where: {
        userId,
        isActive: true,
      },
    });
  }

  async insertFailureLog(
    dto: Pick<
      LogPushNotificationFailureEntity,
      'deviceToken' | 'userId' | 'errorMessage' | 'failureTime'
    >,
  ): Promise<void> {
    await this.failureLogRepository.insert(dto);
  }

  async getRecentFailureCount(
    token: string,
    hours: number = 24,
  ): Promise<number> {
    const recentTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    return this.failureLogRepository.count({
      where: {
        deviceToken: token,
        failureTime: MoreThan(recentTime),
      },
    });
  }
}
