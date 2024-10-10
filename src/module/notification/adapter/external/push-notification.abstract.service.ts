import { MessageRequestFormat } from './dto/fcm.dto';
import { NotificationResult } from './dto/notification-result.dto';

export abstract class PushNotificationService {
  abstract sendNotifications(
    ...dto: MessageRequestFormat[]
  ): Promise<NotificationResult[]>;

  abstract checkTokenFormat(token: string): void;
}
