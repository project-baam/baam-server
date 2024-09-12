import { plainToInstance } from 'class-transformer';
import { NotificationEntity } from '../../adapter/persistence/orm/entities/notification.entity';
import { Notification } from '../../domain/notification';

export class NotificationMapper {
  static toDomain(entity: NotificationEntity): Notification {
    return plainToInstance(Notification, entity, {
      excludeExtraneousValues: true,
    });
  }

  static mapToDomain(entities: NotificationEntity[]): Notification[] {
    return entities.map((entity) => this.toDomain(entity));
  }
}
