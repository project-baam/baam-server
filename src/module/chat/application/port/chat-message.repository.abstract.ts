import { MessageType } from 'src/module/chat/domain/enums/message-type';
import { MessageEntity } from '../../adapter/persistence/entities/message.entity';

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

  abstract removeUnreadMessageTrack(
    messageId: number,
    userId: number,
  ): Promise<void>;

  abstract deleteMessageIfNotLast(messageId: number): Promise<void>;
}
