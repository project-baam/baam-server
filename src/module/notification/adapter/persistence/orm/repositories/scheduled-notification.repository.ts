import { ScheduledNotificationRepository } from 'src/module/notification/application/port/scheduled-notification.repository.abstract';
import { ScheduledNotificationEntity } from '../entities/scheduled-notification.entity';
import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import dayjs from 'dayjs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OrmScheduledNotificationRepository
  implements ScheduledNotificationRepository
{
  constructor(
    @InjectRepository(ScheduledNotificationEntity)
    private readonly scheduledNotificationRepository: Repository<ScheduledNotificationEntity>,
  ) {}

  insertOne(
    dto: Omit<
      ScheduledNotificationEntity,
      'id' | 'createdAt' | 'updatedAt' | 'userDevice'
    >,
  ): Promise<ScheduledNotificationEntity> {
    return this.scheduledNotificationRepository.save({
      ...dto,
      scheduledAt: dayjs(dto.scheduledAt)
        .add(1, 'minute')
        .startOf('minute')
        .format(),
    });
  }

  insertMany(
    dtos: Omit<
      ScheduledNotificationEntity,
      'id' | 'createdAt' | 'updatedAt' | 'userDevice'
    >[],
  ): Promise<ScheduledNotificationEntity[]> {
    return this.scheduledNotificationRepository.save(
      dtos.map((e) => {
        return {
          ...e,
          scheduledAt: dayjs(e.scheduledAt)
            .add(1, 'minute')
            .startOf('minute')
            .format(),
        };
      }),
    );
  }

  async deleteOne(id: number): Promise<void> {
    await this.scheduledNotificationRepository.delete(id);
  }

  async findScheduledBetween(
    start: Date,
    end: Date,
  ): Promise<ScheduledNotificationEntity[]> {
    return this.scheduledNotificationRepository.find({
      where: {
        scheduledAt: Between(start, end),
      },
      order: {
        scheduledAt: 'ASC',
      },
    });
  }
}
