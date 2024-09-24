import {
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { MAX_MESSAGE_LENGTH } from 'src/module/chat/domain/constants/chat.constants';

export class SendTextMessageDto {
  @MaxLength(MAX_MESSAGE_LENGTH)
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
