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
import { MessageEntity } from '../adapter/persistence/entities/message.entity';
import { ReportProvider } from 'src/common/provider/report.provider';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChatMessageService {
  constructor(
    private readonly chatMessageRepository: ChatMessageRepository,
    private readonly chatRoomRepository: ChatRoomRepository,
    private readonly objectStorageService: ObjectStorageService,
    private readonly environmentService: EnvironmentService,
    private readonly chatGateway: ChatGateway,
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

  async sendTextMessage(
    roomId: string,
    senderId: number,
    content: string,
  ): Promise<Message> {
    const message = await this.chatMessageRepository.createMessage(
      roomId,
      senderId,
      MessageType.TEXT,
      content,
    );

    this.sendOrQueueMessage(roomId, senderId, message).catch((error) => {
      ReportProvider.error(error, {
        roomId,
        senderId,
        message,
      });
    });

    return ChatMessageMapper.toDomain(message);
  }

  async sendFileMessage(
    roomId: string,
    senderId: number,
    fileData: Buffer,
    fileName: string,
    fileSize: number,
    mimeType: string,
  ): Promise<Message> {
    const uniqueKey = this.generateUniqueKey(fileName);

    const file = {
      buffer: fileData,
      originalname: fileName,
      size: fileSize,
      mimetype: mimeType,
    } as Express.Multer.File;

    const fileUrl = await this.objectStorageService.uploadFile({
      file,
      category: StorageCategory.CHAT_FILES,
      environment: this.environmentService.get<SupportedEnvironment>('ENV')!,
      uniqueKey,
    });

    const message = await this.chatMessageRepository.createMessage(
      roomId,
      senderId,
      MessageType.FILE,
      {
        fileUrl,
        fileName: Buffer.from(file.originalname, 'ascii')
          .toString('utf-8')
          .normalize('NFC'),
        fileSize: file.size,
      },
    );

    this.sendOrQueueMessage(roomId, senderId, message).catch((error) => {
      ReportProvider.error(error, {
        roomId,
        senderId,
        message,
      });
    });

    return ChatMessageMapper.toDomain(message);
  }

  /**
   *  온라인 유저에게는 메시지 발송, 오프라인 유저에게는 메시지 보관
   */
  private async sendOrQueueMessage(
    roomId: string,
    senderId: number,
    message: MessageEntity,
  ): Promise<void> {
    const participants =
      await this.chatRoomRepository.getChatRoomParticipants(roomId);

    for (const participant of participants) {
      if (
        participant.userId !== senderId &&
        this.chatGateway.isUserInRoom(participant.userId, roomId)
      ) {
        this.chatGateway.sendMessageToUser(participant.userId, message);
      } else {
        await this.chatMessageRepository.trackUnreadMessage(
          message.id,
          participant.userId,
        );
      }
    }
  }

  private generateUniqueKey(fileName: string): string {
    const timestamp = Date.now();
    const randomString = uuidv4().split('-')[0]; // UUID의 첫 부분만 사용
    const extension = path.extname(fileName);
    const baseName = path.basename(fileName, extension);

    return `${baseName}-${timestamp}-${randomString}${extension}`;
  }
}
