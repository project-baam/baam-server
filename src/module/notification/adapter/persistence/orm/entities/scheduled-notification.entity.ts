import { BaseEntity } from 'src/config/database/orm/base.entity';
import { NotificationCategory } from 'src/module/notification/domain/enums/notification-category.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NotificationData } from 'src/module/notification/domain/notification';
import { UserProfileEntity } from 'src/module/user/adapter/persistence/orm/entities/user-profile.entity';

/**
 *  발송 예정 알림
 * - 예정된 시간에 푸시 알림 발송(FCM)
 * - 발송 완료시 삭제(일부 디바이스 실패시 해당 디바이스 토큰만을 제외하고 성공한 디바이스 토큰은 삭제)
 * - 발송 실패시 log_push_notification_failure 에 저장
 * (일정 횟수 이상 실패시 해당 deviceToken 비활성화)
 *
 */
@Entity('scheduled_notification')
export class ScheduledNotificationEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  userId: number;

  @Column('json')
  deviceTokens: string[];

  @Column('enum', { enum: NotificationCategory })
  category: NotificationCategory; // 푸시알림 의 data 안에 속성으로도 들어가지만(앱에서 사용하기 위해 추가)

  @Column('varchar', { comment: '푸시알림 title' })
  pushTitle: string;

  @Column('varchar', { comment: '푸시알림 body' })
  pushMessage?: string;

  @Column('varchar', {
    nullable: true,
    comment: '푸시알림 data, category 에 따라 다름, category 속성도 포함',
  })
  pushData?: NotificationData & { category: NotificationCategory };

  @Column('varchar', { comment: 'notification entity 의 title' })
  notificationTitle: string;

  @Column('json', { comment: 'notification entity 의 body' })
  notificationBody: NotificationData;

  @Column('varchar', { nullable: true })
  notificationMessage?: string | null;

  @Column('timestamp', { comment: '푸시알림 발송 시간' })
  scheduledAt: Date;

  @ManyToOne(() => UserProfileEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserProfileEntity;
}
