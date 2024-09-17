import { IsDefined, IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

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

  @IsString()
  fileName: string;

  @IsString()
  fileType: string;

  @IsNumber() // validate file size
  fileSize: number;

  @IsDefined() // TODO:
  fileData: ArrayBuffer;
}
