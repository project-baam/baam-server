import { Injectable } from '@nestjs/common';
import { NotificationRepository } from 'src/module/notification/application/port/notification.repository.abstract';

@Injectable()
export class OrmNotificationRepository implements NotificationRepository {
  create(notification: Notification): Promise<Notification> {
    throw new Error('Method not implemented.');
  }
  update(notification: Notification): Promise<Notification> {
    throw new Error('Method not implemented.');
  }
  delete(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  findById(id: string): Promise<Notification> {
    throw new Error('Method not implemented.');
  }
  findAll(): Promise<Notification[]> {
    throw new Error('Method not implemented.');
  }
}
