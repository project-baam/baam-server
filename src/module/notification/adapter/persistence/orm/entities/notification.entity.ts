import { BaseEntity } from 'src/config/database/orm/base.entity';
import { NotificationCategory } from 'src/module/notification/domain/enums/notification-category.enum';
import { UserProfileEntity } from 'src/module/user/adapter/persistence/orm/entities/user-profile.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('notification')
export class NotificationEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  userId: number;

  @Column('enum', { enum: NotificationCategory })
  category: NotificationCategory;

  @Column('varchar')
  title: string;

  @Column('json')
  body: object; // TODO: body type 정의

  @Column('timestamp', { comment: '푸시알림 발송 시간' })
  scheduledAt: Date;

  @Column('boolean', { default: false })
  isRead: boolean;

  @ManyToOne(() => UserProfileEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserProfileEntity;
}
