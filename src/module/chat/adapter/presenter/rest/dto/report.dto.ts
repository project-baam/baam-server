import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { MAX_REPORT_REASON_LENGTH } from '../constants/chat-message-report';

/**
 * TODO: 현재 서버 정책상 미확인 메시지만 저장하기 때문에 프론트엔드에서 전달받은 내용을 그대로 검증 없이 신고
 * 추후 message id 를 받아서 검증 등 고려
 */
export class ReportDisruptiveMessageDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  messageContent?: string;

  @ApiProperty()
  @IsNumber()
  senderId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_REPORT_REASON_LENGTH)
  reason?: string;
}
