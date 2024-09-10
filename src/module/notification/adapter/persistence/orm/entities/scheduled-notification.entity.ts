import { BaseEntity } from 'src/config/database/orm/base.entity';
import { NotificationCategory } from 'src/module/notification/domain/enums/notification-category.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NotificationDevicesEntity } from './notification-devices.entity';

/**
 *  발송 예정 알림
 * - 예정된 시간에 푸시 알림 발송(Expo)
 * - 발송 완료시 삭제
 * - 발송 실패시 log_push_notification_failure 에 저장
 * (일정 횟수 이상 실패시 해당 deviceToken 비활성화)
 *
 */
@Entity('scheduled_notification')
export class ScheduledNotificationEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  userDeviceId: number;

  @Column('enum', { enum: NotificationCategory })
  category: NotificationCategory; // expo 의 data 안에 속성으로 들어감(앱에서 사용하기 위해 추가)

  @Column('varchar')
  pushTitle: string; // expo 의 title

  @Column('varchar')
  pushMessage?: string; // expo 의 body

  @Column('varchar', { nullable: true })
  pushData?: object; // category 에 따라 다른 데이터, category 도 포함

  @Column('varchar')
  notificationTitle: string; // notification entity 의 title

  @Column('json')
  notificationBody: object; // notification entity 의 body

  @Column('varchar', { nullable: true })
  notificationMessage?: string | null;

  @Column('timestamp', { comment: '푸시알림 발송 시간' })
  scheduledAt: Date;

  @ManyToOne(() => NotificationDevicesEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_device_id' })
  userDevices: NotificationDevicesEntity;
}
