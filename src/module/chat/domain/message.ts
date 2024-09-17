import { MessageType } from './enums/message-type';

export class Message {
  type: MessageType;
  sender: {
    id: number;
    name: string;
    profileImageUrl?: string | null;
  };
  content?: string | null;
  file?: {
    url: string;
    name: string;
    size: number;
  } | null;
  sentAt: Date;
}
