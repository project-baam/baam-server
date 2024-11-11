import { BaseEntity } from 'src/config/database/orm/base.entity';
import {
  DeviceType,
  OSType,
} from 'src/module/notification/domain/enums/device.enum';
import { UserEntity } from 'src/module/user/adapter/persistence/orm/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Unique(['userId', 'deviceToken'])
@Entity('notification_devices')
export class NotificationDevicesEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  @Index()
  userId: number;

  @Column()
  deviceToken: string;

  @Column({
    type: 'enum',
    enum: DeviceType,
  })
  deviceType: DeviceType;

  @Column({
    type: 'enum',
    enum: OSType,
  })
  osType: OSType;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
