import { ChatMessageMapper } from './mappers/chat-message.mapper';
import { ChatRoomRepository } from 'src/module/chat/application/port/chat-room.repository.abstract';
import { ChatGateway } from './../adapter/presenter/websocket/chat.gateway';
import { EnvironmentService } from './../../../config/environment/environment.service';
import { ObjectStorageService } from 'src/module/object-storage/application/object-storage.service.abstract';
import { ChatMessageRepository } from 'src/module/chat/application/port/chat-message.repository.abstract';
import { Injectable } from '@nestjs/common';
import { Message } from '../domain/message';
import { MessageType } from '../domain/enums/message-type';
import { StorageCategory } from 'src/module/object-storage/domain/enums/storage-category.enum';
import { SupportedEnvironment } from 'src/config/environment/environment';
import { MessageEntity } from '../adapter/persistence/orm/entities/message.entity';
import { ReportProvider } from 'src/common/provider/report.provider';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ReportDisruptiveMessageDto } from '../adapter/presenter/rest/dto/report.dto';
import { ReportStatus } from '../domain/enums/report.enums';
import { getExpirationDate } from '../adapter/presenter/websocket/constants/chat-file-expiration';
import { MessageEncryptionService } from '../adapter/persistence/chat-message-encryption.service';

@Injectable()
export class ChatMessageService {
  constructor(
    private readonly chatMessageRepository: ChatMessageRepository,
    private readonly chatRoomRepository: ChatRoomRepository,
    private readonly objectStorageService: ObjectStorageService,
    private readonly environmentService: EnvironmentService,
    private readonly chatGateway: ChatGateway,
    private messageEncryptionService: MessageEncryptionService,
  ) {}

  async markMessagesAsDelivered(
    messageIds: number[],
    userId: number,
  ): Promise<void> {
    return this.chatMessageRepository.removeUnreadMessagesTrack(
      messageIds,
      userId,
    );
  }

  async getUndeliveredMessages(
    roomId: string,
    userId: number,
  ): Promise<MessageEntity[]> {
    return this.chatMessageRepository.getUnreadMessages(roomId, userId);
  }

  async sendSystemMessage(roomId: string, content: string) {
    const messageEntity = await this.chatMessageRepository.createMessage(
      roomId,
      null,
      MessageType.SYSTEM,
      content,
    );

    await this.sendOrQueueMessage(roomId, null, messageEntity).catch(
      (error) => {
        ReportProvider.error(error, {
          roomId,
          messageEntity,
        });
      },
    );

    return ChatMessageMapper.toDomain(messageEntity);
  }

  async sendTextMessage(
    roomId: string,
    senderId: number,
    content: string,
  ): Promise<Message> {
    const messageEntity = await this.chatMessageRepository.createMessage(
      roomId,
      senderId,
      MessageType.TEXT,
      content,
    );

    await this.sendOrQueueMessage(roomId, senderId, messageEntity).catch(
      (error) => {
        ReportProvider.error(error, {
          roomId,
          senderId,
          messageEntity,
        });
      },
    );

    return ChatMessageMapper.toDomain(messageEntity);
  }

  async sendFileMessage(
    roomId: string,
    senderId: number,
    fileData: Buffer,
    fileName: string,
    fileSize: number,
    mimeType: string,
  ): Promise<Message> {
    const uniqueKey = this.generateUniqueKey(
      fileName + new Date().toISOString(),
    );

    const file = {
      buffer: fileData,
      originalname: fileName,
      size: fileSize,
      mimetype: mimeType,
    } as Express.Multer.File;

    const fileExpiredAt = getExpirationDate(mimeType);

    const fileUrl = await this.objectStorageService.uploadFile({
      file,
      category: StorageCategory.CHAT_FILES,
      environment: this.environmentService.get<SupportedEnvironment>('ENV')!,
      uniqueKey,
      expiredAt: fileExpiredAt,
    });

    const messageEntity = await this.chatMessageRepository.createMessage(
      roomId,
      senderId,
      MessageType.FILE,
      {
        fileUrl,
        fileName,
        fileSize: file.size,
        fileExpiredAt,
      },
    );

    this.sendOrQueueMessage(roomId, senderId, messageEntity).catch((error) => {
      ReportProvider.error(error, {
        roomId,
        senderId,
        messageEntity,
      });
    });

    return ChatMessageMapper.toDomain(messageEntity);
  }

  /**
   *  온라인 유저에게는 메시지 발송, 오프라인 유저에게는 메시지 보관
   */
  private async sendOrQueueMessage(
    roomId: string,
    senderId: number | null,
    message: MessageEntity,
  ): Promise<void> {
    const participants =
      await this.chatRoomRepository.getChatRoomParticipants(roomId);

    for (const participant of participants) {
      if (this.chatGateway.isUserInRoom(participant.userId, roomId)) {
        this.chatGateway.sendMessageToUser(
          participant.userId,
          ChatMessageMapper.toDomain({
            ...message,
            content:
              message.type !== MessageType.FILE && message.content
                ? this.messageEncryptionService.decrypt(message.content)
                : message.content,
          }),
        );
      } else {
        await this.chatMessageRepository.trackUnreadMessage(
          message.id,
          participant.userId,
        );
      }
    }
  }

  async sendMessageToUser(
    userId: number,
    roomId: string,
    message: MessageEntity,
  ): Promise<void> {
    const undeliveredMessages = await this.getUndeliveredMessages(
      roomId,
      userId,
    );
    const isUndelivered = undeliveredMessages.some((m) => m.id === message.id);

    if (isUndelivered) {
      await this.chatGateway.sendMessageToUser(
        userId,
        ChatMessageMapper.toDomain(message),
      );
      await this.markMessagesAsDelivered([message.id], userId);
    }
  }

  private generateUniqueKey(fileName: string): string {
    const timestamp = Date.now();
    const randomString = uuidv4().split('-')[0];
    const extension = path.extname(fileName);
    const baseName = path.basename(fileName, extension);

    return `${baseName}-${timestamp}-${randomString}${extension}`;
  }

  async reportDisruptiveMessage(
    userId: number,
    dto: ReportDisruptiveMessageDto,
  ) {
    const encryptedMessageContent = dto.messageContent
      ? this.messageEncryptionService.encrypt(dto.messageContent)
      : undefined;

    const log =
      await this.chatMessageRepository.insertLogReportingDisruptiveMessage(
        userId,
        {
          ...dto,
          messageContent: encryptedMessageContent,
        },
      );

    // TODO: 우선 DB에 저장만 하고 있으므로 추후 신고 처리 로직 추가(기획 부재)
    // const [reportedUserTotalReportsCount, reporterUserTotalReportsCount] =
    //   await Promise.all([
    //     this.chatMessageRepository.countReportedUserTotalReports(dto.senderId),
    //     this.chatMessageRepository.countReporterTotalReports(userId),
    //   ]);

    // const reportContent: {
    //   '신고한 사용자 ID': number;
    //   '신고자 누적 신고 수': number;
    //   '피신고자 누적 신고 수': number;
    //   '메시지 발송 사용자 ID': number;
    //   '메시지 내용': string | undefined;
    //   '신고 사유': string | undefined;
    //   '신고 시간': Date;
    //   '신고 처리 상태': ReportStatus;
    //   파일?: string;
    // } = {
    //   '신고한 사용자 ID': userId,
    //   '신고자 누적 신고 수': reporterUserTotalReportsCount,
    //   '피신고자 누적 신고 수': reportedUserTotalReportsCount,
    //   '메시지 발송 사용자 ID': dto.senderId,
    //   '메시지 내용': encryptedMessageContent,
    //   '신고 사유': dto.reason,
    //   '신고 시간': log.reportedAt,
    //   '신고 처리 상태': ReportStatus.PENDING,
    // };
    // if (dto?.fileUrl) {
    //   reportContent['파일'] = `${dto?.fileUrl} ${dto?.fileSize}`;
    // }

    // if (log) {
    //   ReportProvider.reportChatIssue(reportContent);
    // }
  }
}
