import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';
import { ScheduledNotificationEntity } from '../../persistence/orm/entities/scheduled-notification.entity';
import { truncateData } from 'src/module/util/truncate-data';
import { FCM_LIMITS } from '../constants/fcm.constants';

export class MessageRequestFormat {
  @ApiProperty()
  @IsString()
  to: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  body: string;

  @ApiProperty({
    required: false,
    example: {
      category: '나의 수업함',
      memoId: 3,
    },
  })
  @IsObject()
  @IsOptional()
  data?: { [key: string]: string };

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
        body: entity.pushMessage || '',
        data: truncateData(entity.pushData, FCM_LIMITS.MAX_PAYLOAD_SIZE_BYTES),
      };
    });
  }
}
