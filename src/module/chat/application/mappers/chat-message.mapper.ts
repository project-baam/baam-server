import { Message } from '../../domain/message';
import { MessageEntity } from '../../adapter/persistence/orm/entities/message.entity';
export class ChatMessageMapper {
  static toDomain(entity: MessageEntity): Message {
    return {
      type: entity.type,
      sender: entity.senderId
        ? {
            id: entity.senderId,
            name: entity.sender.fullName,
            profileImageUrl: entity.sender.profileImageUrl,
          }
        : null,
      content: entity?.content ?? null,
      file:
        entity.fileUrl && entity.fileName && entity.fileSize !== undefined
          ? {
              url: entity.fileUrl,
              name: entity.fileName,
              size: entity.fileSize,
              expiredAt: entity.fileExpiredAt,
            }
          : null,
      sentAt: entity.createdAt,
    };
  }

  static mapToDomain(entities: MessageEntity[]): Message[] {
    return entities.map((entity) => this.toDomain(entity));
  }
}
