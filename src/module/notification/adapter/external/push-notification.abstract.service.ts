import { MessageRequestFormat } from './dto/expo.dto';

export abstract class PushNotificationService {
  abstract sendNotification(dto: MessageRequestFormat): Promise<boolean>;
}
