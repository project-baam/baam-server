import { ChatRoomRepository } from 'src/module/chat/application/port/chat-room.repository.abstract';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MessageEntity } from '../entities/message.entity';
import { UnreadMessageTrackerEntity } from '../entities/unread-message-tracker.entity';
import { MessageType } from 'src/module/chat/domain/enums/message-type';
import { ChatMessageRepository } from 'src/module/chat/application/port/chat-message.repository.abstract';
import { LogChatMessageReportEntity } from '../entities/log-chat-message-report.entity';
import { ReportDisruptiveMessageDto } from '../../../presenter/rest/dto/report.dto';
import { MessageEncryptionService } from 'src/module/chat/adapter/persistence/chat-message-encryption.service';

export class OrmChatMessageRepository implements ChatMessageRepository {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,

    @InjectRepository(UnreadMessageTrackerEntity)
    private readonly unreadMessageTrackerRepository: Repository<UnreadMessageTrackerEntity>,

    private readonly chatRoomRepository: ChatRoomRepository,

    @InjectRepository(LogChatMessageReportEntity)
    private readonly logChatMessageReportRepository: Repository<LogChatMessageReportEntity>,

    private messageEncryptionService: MessageEncryptionService,
  ) {}

  async createMessage(
    roomId: string,
    senderId: number,
    type: MessageType,
    contentOrFileInfo:
      | string
      | {
          fileUrl: string;
          fileName: string;
          fileSize?: number;
          fileExpiredAt?: Date;
        },
  ): Promise<MessageEntity> {
    const previousLastMessage = await this.messageRepository.findOne({
      relations: { chatRoom: true },
      where: {
        roomId,
        isLastMessage: true,
      },
    });

    if (previousLastMessage) {
      await this.messageRepository.update(previousLastMessage.id, {
        isLastMessage: false,
      });
    }

    const messageData: Partial<MessageEntity> = {
      type,
      senderId,
      roomId,
      isLastMessage: true,
    };

    if (type === MessageType.TEXT || type == MessageType.SYSTEM) {
      messageData.content = this.messageEncryptionService.encrypt(
        contentOrFileInfo as string,
      );
    } else if (type === MessageType.FILE) {
      const fileInfo = contentOrFileInfo as {
        fileUrl: string;
        fileName: string;
        fileSize?: number;
        fileExpiredAt?: Date;
      };
      messageData.fileUrl = fileInfo.fileUrl;
      messageData.fileName = fileInfo.fileName;
      messageData.fileSize = fileInfo.fileSize;
      messageData.fileExpiredAt = fileInfo.fileExpiredAt;
      messageData.content = this.messageEncryptionService.encrypt(
        fileInfo.fileName,
      );
    }

    const message = await this.messageRepository.save(
      this.messageRepository.create(messageData),
    );
    await this.chatRoomRepository.updateLastMessage(roomId, message.id);

    return (await this.messageRepository.findOne({
      where: { id: message.id },
      relations: {
        sender: true,
        chatRoom: true,
      },
    }))!;
  }

  async getUnreadMessages(
    roomId: string,
    userId: number,
  ): Promise<MessageEntity[]> {
    return (
      await this.unreadMessageTrackerRepository.find({
        relations: {
          message: {
            sender: true,
          },
        },
        where: { userId, message: { roomId } },
      })
    ).map((e) => {
      return {
        ...e.message,
        content:
          e.message.type !== MessageType.FILE && e.message.content
            ? this.messageEncryptionService.decrypt(e.message.content)
            : e.message.content,
      };
    });
  }

  async trackUnreadMessage(messageId: number, userId: number): Promise<void> {
    await this.unreadMessageTrackerRepository.insert({ messageId, userId });
  }

  async removeUnreadMessagesTrack(
    messageIds: number[],
    userId: number,
  ): Promise<void> {
    await this.unreadMessageTrackerRepository.delete({
      messageId: In(messageIds),
      userId,
    });

    // 모든 사용자가 읽었다면 메시지 삭제 & 해당 채팅방의 마지막 메시지 갱신
    await this.deleteMessageIfNotLast(messageIds);
  }

  async deleteMessageIfNotLast(messageIds: number[]): Promise<void> {
    for (const messageId of messageIds) {
      const remainingTracks = await this.unreadMessageTrackerRepository.countBy(
        {
          messageId,
        },
      );

      // 모두가 읽은 경우
      if (remainingTracks === 0) {
        const message = await this.messageRepository.findOne({
          where: { id: messageId },
          relations: { chatRoom: true },
        });
        if (message) {
          // 마지막 메시지가 아닌 경우에만 삭제
          if (!message.isLastMessage) {
            await this.messageRepository.delete(messageId);
          }
        }
      }
    }
  }

  async insertLogReportingDisruptiveMessage(
    reportingUserId: number,
    dto: ReportDisruptiveMessageDto,
  ): Promise<LogChatMessageReportEntity> {
    return this.logChatMessageReportRepository.save({
      content: dto.messageContent,
      reportingUserId,
      reportedUserId: dto.senderId,
      fileUrl: dto.fileUrl,
      fileSize: dto.fileSize,
      reason: dto.reason,
    });
  }

  async countReporterTotalReports(reportingUserId: number): Promise<number> {
    const result = await this.logChatMessageReportRepository
      .createQueryBuilder('report')
      .select('COUNT(report.id)', 'totalReports')
      .where('report.reportingUserId = :reportingUserId', { reportingUserId })
      .getRawOne();

    return result ? parseInt(result.totalReports, 10) : 0;
  }

  async countReportedUserTotalReports(reportedUserId: number): Promise<number> {
    const result = await this.logChatMessageReportRepository
      .createQueryBuilder('report')
      .select('COUNT(report.id)', 'totalReports')
      .where('report.reportedUserId = :reportedUserId', { reportedUserId })
      .getRawOne();

    return result ? parseInt(result.totalReports, 10) : 0;
  }
}
