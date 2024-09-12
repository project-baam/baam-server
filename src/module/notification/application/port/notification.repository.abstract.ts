import { PaginatedList } from 'src/common/dto/response.dto';
import { NotificationEntity } from '../../adapter/persistence/orm/entities/notification.entity';
import { GetNotificationRequest } from '../../adapter/presenter/rest/dto/get-notification.dto';

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

  /**
   * 최근 발송된 알림 순으로 정렬
   */
  abstract findPaginated(
    userId: number,
    params: GetNotificationRequest,
  ): Promise<PaginatedList<NotificationEntity>>;
}
