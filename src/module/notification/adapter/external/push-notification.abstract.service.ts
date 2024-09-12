import { MessageRequestFormat } from './dto/expo.dto';
import { NotificationResult } from './dto/notification-result.dto';

export abstract class PushNotificationService {
  abstract sendNotifications(
    ...dto: MessageRequestFormat[]
  ): Promise<NotificationResult[]>;
}
