import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import {
  AdminDecision,
  ReportStatus,
} from 'src/module/chat/domain/enums/report.enums';

@Entity('log_chat_message_report')
export class LogChatMessageReportEntity {
  @PrimaryGeneratedColumn('increment')
  id: string;

  // @Column('int')
  // messageId: number;

  @Column('text', { nullable: true })
  content: string;

  @Column('text', { nullable: true })
  reason: string;

  @Column('int')
  reportingUserId: number;

  @Column('int')
  reportedUserId: number;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;

  @Column({
    type: 'enum',
    enum: AdminDecision,
    nullable: true,
  })
  adminDecision: AdminDecision;

  @Column('text', { nullable: true })
  adminComment: string;

  @CreateDateColumn({ type: 'timestamp' })
  reportedAt: Date;

  @Column('timestamp', { nullable: true })
  reviewedAt: Date;

  @Column('varchar', { length: 255, nullable: true })
  fileUrl: string;

  @Column('int', { nullable: true })
  fileSize: number;
}
