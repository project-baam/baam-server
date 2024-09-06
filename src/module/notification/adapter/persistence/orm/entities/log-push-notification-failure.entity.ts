import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class LogPushNotificationFailureEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  deviceToken: string;

  @Column('int', { nullable: true })
  userId: number | null;

  @Column('varchar')
  errorMessage: string;

  @Column('timestamp')
  failureTime: Date;
}
