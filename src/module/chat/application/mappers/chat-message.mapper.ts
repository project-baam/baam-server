import { Message } from '../../domain/message';
import { MessageEntity } from './../../adapter/persistence/entities/message.entity';
export class ChatMessageMapper {
  static toDomain(entity: MessageEntity): Message {
    return {
      type: entity.type,
      sender: {
        id: entity.senderId,
        name: entity.sender.fullName,
        profileImageUrl: entity.sender.profileImageUrl,
      },
      content: entity?.content ?? null,
      file:
        entity.fileUrl && entity.fileName && entity.fileSize !== undefined
          ? {
              url: entity.fileUrl,
              name: entity.fileName,
              size: entity.fileSize,
            }
          : null,
      sentAt: entity.createdAt,
    };
  }
}
