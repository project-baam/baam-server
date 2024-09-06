import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class MessageRequestFormat {
  @ApiProperty({ description: 'ExponentPushToken' })
  @IsString()
  to: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  data?: object;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  body?: string;
}
