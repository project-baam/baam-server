import { FriendService } from 'src/module/friend/application/friend.service';
import { Injectable } from '@nestjs/common';
import { ChatRepository } from './port/chat.repository.abstract';
import { plainToInstance } from 'class-transformer';
import { Participant } from '../domain/participant';
import { ContentNotFoundError } from 'src/common/types/error/application-exceptions';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly friendService: FriendService,
  ) {}

  async getUserChatRooms(userId: number) {
    return this.chatRepository.getUserChatRooms(userId);
  }

  async getChatRoomParticipants(
    userId: number,
    roomId: string,
  ): Promise<Participant[]> {
    await this.chatRepository.findChatRoomByIdOrFail(roomId);
    if (!(await this.chatRepository.isUserInChatRoom(userId, roomId))) {
      throw new ContentNotFoundError('chatroom-user', `${roomId}-${userId}`);
    }

    const participants =
      await this.chatRepository.getChatRoomParticipants(roomId);

    return (await this.friendService.addFriendsActiveClass(participants)).map(
      (e) => {
        return plainToInstance(
          Participant,
          {
            ...e.friend.user,
            profileImage: e.friend.user.profileImageUrl,
            activeClassNow: e.activeClassNow,
          },
          { excludeExtraneousValues: true },
        );
      },
    );
  }
}
