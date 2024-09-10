export interface SubjectMemoNotificationDto {
  eventId: number; // 과목별 메모는 event 의 class type 임
  subjectName: string;
}

export interface CalendarNotificationDto {
  eventId: number;
  eventTitle: string;
}

export interface FriendRequestNotificationDto {
  requestId: number;
  requestType: 'sent' | 'received';
  friendName: string;
}

export type NotificationDto =
  | SubjectMemoNotificationDto
  | CalendarNotificationDto
  | FriendRequestNotificationDto;
