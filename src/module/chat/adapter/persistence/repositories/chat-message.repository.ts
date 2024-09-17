import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity } from '../entities/message.entity';
import { UnreadMessageTrackerEntity } from '../entities/unread-message-tracker.entity';
import { MessageType } from 'src/module/chat/domain/enums/message-type';
import { ChatMessageRepository } from 'src/module/chat/application/port/chat-message.repository.abstract';

export class OrmChatMessageRepository implements ChatMessageRepository {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,

    @InjectRepository(UnreadMessageTrackerEntity)
    private readonly unreadMessageTrackerRepository: Repository<UnreadMessageTrackerEntity>,
  ) {}

  async createMessage(
    roomId: string,
    senderId: number,
    type: MessageType,
    contentOrFileInfo:
      | string
      | { fileUrl: string; fileName: string; fileSize?: number },
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

    if (type === MessageType.TEXT) {
      messageData.content = contentOrFileInfo as string;
    } else if (type === MessageType.FILE) {
      const fileInfo = contentOrFileInfo as {
        fileUrl: string;
        fileName: string;
        fileSize?: number;
      };
      messageData.fileUrl = fileInfo.fileUrl;
      messageData.fileName = fileInfo.fileName;
      messageData.fileSize = fileInfo.fileSize;
    }

    const message = this.messageRepository.create(messageData);

    return this.messageRepository.save(message);
  }

  async getUnreadMessages(
    roomId: string,
    userId: number,
  ): Promise<MessageEntity[]> {
    return (
      await this.unreadMessageTrackerRepository.find({
        relations: {
          message: true,
        },
        where: { userId, message: { roomId } },
      })
    ).map((e) => e.message);
  }

  // TODO: 암호화 추가
  async trackUnreadMessage(messageId: number, userId: number): Promise<void> {
    await this.unreadMessageTrackerRepository.insert({ messageId, userId });
  }

  async removeUnreadMessageTrack(
    messageId: number,
    userId: number,
  ): Promise<void> {
    await this.unreadMessageTrackerRepository.delete({
      messageId,
      userId,
    });

    // 모든 사용자가 읽었다면 메시지 삭제 & 해당 채팅방의 마지막 메시지 갱신
    this.deleteMessageIfNotLast(messageId);
  }

  async deleteMessageIfNotLast(messageId: number): Promise<void> {
    const remainingTracks = await this.unreadMessageTrackerRepository.countBy({
      messageId,
    });

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
