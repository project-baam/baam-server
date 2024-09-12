import { PaginatedList } from 'src/common/dto/response.dto';
import { NotificationEntity } from '../../adapter/persistence/orm/entities/notification.entity';

export abstract class NotificationRepository {
  abstract insertOne(
    dto: Pick<
      NotificationEntity,
      'userId' | 'category' | 'title' | 'body' | 'sentAt'
    > &
      Partial<Pick<NotificationEntity, 'message'>>,
  ): Promise<void>;

  abstract update(
    id: number,
    notification: Partial<Pick<NotificationEntity, 'isRead'>>,
  ): Promise<void>;

  abstract findByIdOrFail(
    userId: number,
    id: number,
  ): Promise<NotificationEntity>;

  // abstract findAllPaginated(
  //   userId: number,
  // ): Promise<PaginatedList<NotificationEntity>>;
}
