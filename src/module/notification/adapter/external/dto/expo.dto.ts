import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';
import { ScheduledNotificationEntity } from '../../persistence/orm/entities/scheduled-notification.entity';
import { truncateData } from 'src/module/util/truncate-data';
import { EXPO_LIMITS } from '../constants/expo-limits.constant';

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

  /**
   * 예약된 알림 entity 를 푸시 알림 메시지 형태로 변환
   * @param entity
   */
  static from(
    entity: Pick<
      ScheduledNotificationEntity,
      'deviceTokens' | 'pushMessage' | 'pushTitle' | 'pushData'
    >,
  ): MessageRequestFormat[] {
    return entity.deviceTokens.map((e) => {
      return {
        to: e,
        title: entity.pushTitle,
        body: entity.pushMessage,
        data: truncateData(entity.pushData, EXPO_LIMITS.MAX_PAYLOAD_SIZE_BYTES),
      };
    });
  }
}
