import { BaseEntity } from 'src/config/database/orm/base.entity';
import { DeviceInfo } from 'src/module/util/user-agent-parser.service';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('log_login')
export class LogLoginEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('int')
  userId: number;

  @CreateDateColumn()
  loggedInAt: Date;

  @Column('varchar')
  ipAddress: string;

  @Column('json')
  deviceInfo: DeviceInfo;
}
