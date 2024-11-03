import { BaseEntity } from 'src/config/database/orm/base.entity';
import { NotificationCategory } from 'src/module/notification/domain/enums/notification-category.enum';
import { NotificationData } from 'src/module/notification/domain/notification';
import { UserEntity } from 'src/module/user/adapter/persistence/orm/entities/user.entity';
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

  @Column('varchar', { nullable: true })
  message?: string | null;

  @Column('json')
  body: NotificationData; // 각 알림의 액션에 필요한 데이터(category 에 따라 다름)

  @Column('timestamp')
  sentAt: Date;

  @Column('boolean', { default: false })
  isRead: boolean;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
