import { MessageType } from 'src/module/chat/domain/enums/message-type';
import { MessageEntity } from '../../adapter/persistence/entities/message.entity';
import { LogChatMessageReportEntity } from '../../adapter/persistence/entities/log-chat-message-report.entity';
import { ReportDisruptiveMessageDto } from '../../adapter/presenter/rest/dto/report.dto';

export abstract class ChatMessageRepository {
  abstract createMessage(
    roomId: string,
    senderId: number,
    type: MessageType,
    contentOrFileInfo:
      | string
      | { fileUrl: string; fileName: string; fileSize?: number },
  ): Promise<MessageEntity>;

  abstract getUnreadMessages(
    roomId: string,
    userId: number,
  ): Promise<MessageEntity[]>;

  abstract trackUnreadMessage(messageId: number, userId: number): Promise<void>;

  abstract removeUnreadMessagesTrack(
    messageIds: number[],
    userId: number,
  ): Promise<void>;

  abstract deleteMessageIfNotLast(messageIds: number[]): Promise<void>;

  abstract insertLogReportingDisruptiveMessage(
    reportingUserId: number,
    dto: ReportDisruptiveMessageDto,
  ): Promise<LogChatMessageReportEntity>;

  abstract countReporterTotalReports(reportingUserId: number): Promise<number>;

  abstract countReportedUserTotalReports(
    reportedUserId: number,
  ): Promise<number>;
}
