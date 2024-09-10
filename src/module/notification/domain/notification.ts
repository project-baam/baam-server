import { NotificationCategory } from './enums/notification-category.enum';

// NotificationData 는 각 알림의 액션에 필요한 데이터(category 에 따라 다름)
// 추후 확정 가능성 있음
interface CalendarNotificationData {
  eventId: string;
}

interface SubjectMemoNotificationData {
  memoId: string;
}

interface FriendRequestNotificationData {
  requestId: number; // 수락, 거절/취소 시 사용
  requestType: 'sent' | 'received';
}

export type NotificationData =
  | CalendarNotificationData
  | SubjectMemoNotificationData
  | FriendRequestNotificationData;

export class Notification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: NotificationData;
  sentAt: Date; // 알립 발송 시간
  isRead: boolean;
}
