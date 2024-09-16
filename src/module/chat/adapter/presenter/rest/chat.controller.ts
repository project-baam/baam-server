import { Get, HttpStatus, Param, ParseUUIDPipe } from '@nestjs/common';
import { RestApi } from 'src/common/decorator/rest-api.decorator';
import { ResponseListDto } from 'src/common/dto/responses-list.dto';
import { AuthorizationToken } from 'src/docs/constant/authorization-token';
import { ApiDescription } from 'src/docs/decorator/api-description.decorator';
import { ChatService } from 'src/module/chat/application/chat.service';
import { ChatRoom } from 'src/module/chat/domain/chat-room';
import { CHAT_ROOM_MAX_PARTICIPANTS } from 'src/module/chat/domain/constants/chat.constants';
import { Participant } from 'src/module/chat/domain/participant';
import { ActiveUser } from 'src/module/iam/adapter/presenter/rest/decorators/active-user.decorator';
import { UserEntity } from 'src/module/user/adapter/persistence/orm/entities/user.entity';

@RestApi('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiDescription({
    tags: ['Chat'],
    summary: '톡방 목록 조회',
    description: '페이징 처리 생략',
    auth: AuthorizationToken.BearerUserToken,
    listResponse: {
      status: HttpStatus.OK,
      schema: ChatRoom,
    },
  })
  @Get('rooms')
  async getChatRooms(
    @ActiveUser() user: UserEntity,
  ): Promise<ResponseListDto<ChatRoom>> {
    const chatRooms = await this.chatService.getUserChatRooms(user);

    return new ResponseListDto(chatRooms);
  }

  @ApiDescription({
    tags: ['Chat'],
    summary: '톡방 참여자 목록 조회',
    description: `채팅방 최대 인원이 ${CHAT_ROOM_MAX_PARTICIPANTS}명이기 때문에 페이징 처리 생략\n\
    존재하지 않는 채팅방 ID 혹은 참여하지 않은 사용자의 경우 4040 에러 발생`,
    auth: AuthorizationToken.BearerUserToken,
    listResponse: {
      status: HttpStatus.OK,
      schema: Participant,
    },
  })
  @Get('rooms/:roomId/participants')
  async getChatRoomParticipants(
    @ActiveUser() user: UserEntity,
    @Param('roomId', ParseUUIDPipe) roomId: string,
  ): Promise<ResponseListDto<Participant>> {
    const participants = await this.chatService.getChatRoomParticipants(
      user.id,
      roomId,
    );

    return new ResponseListDto(participants);
  }
}
