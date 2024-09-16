import { ApiProperty } from '@nestjs/swagger';

export class Message {
  @ApiProperty()
  roomId: string;

  @ApiProperty()
  senderId: number; // user id

  @ApiProperty()
  content: string;

  @ApiProperty()
  createdAt: Date;
}
