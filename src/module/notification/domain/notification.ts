import { ApiProperty } from '@nestjs/swagger';
import { NotificationCategory } from './enums/notification-category.enum';
import { Expose } from 'class-transformer';

// NotificationData 는 각 알림의 액션에 필요한 데이터(category 에 따라 다름)
// 추후 확정 가능성 있음
export interface CalendarNotificationData {
  eventId: number;
}

export interface SubjectMemoNotificationData {
  eventId: number;
}

export interface FriendRequestNotificationData {
  requestId: number; // 수락, 거절/취소 시 사용
  requestType: 'sent' | 'received';
}

export type NotificationData =
  | CalendarNotificationData
  | SubjectMemoNotificationData
  | FriendRequestNotificationData;

// 알림 메뉴에서 보여지는 알림 정보
export class Notification {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty({ type: 'enum', enum: NotificationCategory })
  @Expose()
  category: NotificationCategory;

  @ApiProperty()
  @Expose()
  title: string;

  // NotificationData 타입 변경시 스웨거 수동으로 변경해줘야함
  @ApiProperty({
    description: '각 알림의 액션에 필요한 데이터, category에 따라 다름',
    oneOf: [
      {
        description: NotificationCategory.Calendar,
        type: 'object',
        properties: {
          eventId: { type: 'number' },
        },
      },
      {
        description: NotificationCategory.SubjectMemo,
        type: 'object',
        properties: {
          eventId: { type: 'number' },
        },
      },
      {
        description: NotificationCategory.FriendRequest,
        type: 'object',
        properties: {
          requestId: {
            type: 'number',
            description: '친구 요청 ID(수락/거절, 취소 시 사용',
          },
          requestType: {
            type: 'string',
            enum: ['sent', 'received'],
          },
        },
      },
    ],
  })
  @Expose()
  body: NotificationData;

  @ApiProperty()
  @Expose()
  sentAt: Date; // 알림 발송 시간

  @ApiProperty()
  @Expose()
  isRead: boolean;

  @ApiProperty()
  @Expose()
  message: string;
}
