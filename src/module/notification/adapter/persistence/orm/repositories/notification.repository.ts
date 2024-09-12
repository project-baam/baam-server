import { Injectable } from '@nestjs/common';
import { NotificationRepository } from 'src/module/notification/application/port/notification.repository.abstract';
import { NotificationEntity } from '../entities/notification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentNotFoundError } from 'src/common/types/error/application-exceptions';

@Injectable()
export class OrmNotificationRepository implements NotificationRepository {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
  ) {}

  async insertOne(
    dto: Pick<
      NotificationEntity,
      'userId' | 'category' | 'title' | 'body' | 'sentAt'
    > &
      Partial<Pick<NotificationEntity, 'message'>>,
  ): Promise<void> {
    await this.notificationRepository.insert(dto);
  }

  async update(
    id: number,
    notification: Partial<Pick<NotificationEntity, 'isRead'>>,
  ): Promise<void> {
    await this.notificationRepository.update(id, { ...notification });
  }

  async findByIdOrFail(
    userId: number,
    id: number,
  ): Promise<NotificationEntity> {
    const entity = await this.notificationRepository.findOneBy({ userId, id });

    if (!entity) {
      throw new ContentNotFoundError('notificaton', id);
    }

    return entity;
  }
}
