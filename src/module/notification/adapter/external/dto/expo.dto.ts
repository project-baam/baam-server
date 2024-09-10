import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class MessageRequestFormat {
  @ApiProperty({
    description: 'ExponentPushToken',
    example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
  })
  @IsString()
  to: string;

  @ApiProperty({
    required: false,
    example: {
      category: '나의 수업함',
      memoId: 3,
      sentAt: new Date().toISOString(),
    },
  })
  @IsObject()
  @IsOptional()
  data?: object;

  @ApiProperty({ required: false, example: '나의 수업함 [국어]' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false, example: '준비물이 있습니다.' })
  @IsString()
  @IsOptional()
  body?: string;
}
