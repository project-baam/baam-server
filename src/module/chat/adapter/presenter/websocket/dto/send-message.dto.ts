import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SendTextMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  roomId: string;

  constructor(content: string, roomId: string) {
    this.content = content;
    this.roomId = roomId;
  }
}

export class SendFileMessageDto {
  @IsUUID()
  roomId: string;
}
