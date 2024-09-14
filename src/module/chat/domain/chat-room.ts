export class ChatRoom {
  id: string; // uuid
  name: string;
  participantsCount: number;
  unreadMessageCount: number;
  lastMessage: string;
  lastMessageDate: Date;
}
