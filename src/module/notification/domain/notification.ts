import { NotificationCategory } from './enums/notification-category.enum';

export class Notification {
  id: string;
  category: NotificationCategory; // enum
  title: string;
  body: object; // object ? json?
  scheduledAt: Date;
  isRead: boolean;
}
