import { ApiProperty } from '@nestjs/swagger';

export class ChatRoom {
  @ApiProperty({ type: 'string', format: 'uuid' })
  id: string; // uuid

  @ApiProperty()
  name: string;

  @ApiProperty()
  participantsCount: number;

  @ApiProperty()
  unreadMessageCount: number;

  @ApiProperty({
    type: 'string',
    nullable: true,
    description:
      '마지막 메시지 내용. 텍스트 메시지의 경우 내용, 파일 메시지의 경우 파일명\n\
    nullable=true',
  })
  lastMessage: string | null;

  @ApiProperty({
    type: 'string',
    nullable: true,
    description:
      '마지막 메시지가 작성된 시간을 상대적으로 표현 (예: "방금 전", "5분 전", "2시간 전", "3일 전")\n\
      nullable=true',
    example: '10분 전',
  })
  timeAgo: string | null;
}
