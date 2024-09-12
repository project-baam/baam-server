import { UserService } from 'src/module/user/application/user.service';
import { NotificationService } from 'src/module/notification/application/notification.service';
import { ActiveUser } from 'src/module/iam/adapter/presenter/rest/decorators/active-user.decorator';
import {
  Body,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserEntity } from 'src/module/user/adapter/persistence/orm/entities/user.entity';
import { ApiBooleanResponse } from 'src/docs/decorator/api-boolean-response';
import { ApiDescription } from 'src/docs/decorator/api-description.decorator';
import { AuthorizationToken } from 'src/docs/constant/authorization-token';
import { RegisterDeviceTokenDto } from './dto/register-device-token.dto';
import {
  ContentNotFoundError,
  NotificationAlreadyRead,
} from 'src/common/types/error/application-exceptions';
import { DeactivateDeviceDto } from './dto/deactivate-device.token.dto';
import { PushNotificationService } from '../../external/push-notification.abstract.service';
import { MessageRequestFormat } from '../../external/dto/expo.dto';
import { Auth } from 'src/module/iam/adapter/presenter/rest/decorators/auth.decorator';
import { AuthType } from 'src/module/iam/domain/enums/auth-type.enum';
import { ApiResponse } from '@nestjs/swagger';
import { RestApi } from 'src/common/decorator/rest-api.decorator';

@RestApi()
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  @ApiBooleanResponse()
  @ApiDescription({
    tags: ['알림'],
    summary: '알림 설정 변경',
    auth: AuthorizationToken.BearerUserToken,
  })
  @Patch('notifications-setting')
  async updateNotificationEnabled(
    @ActiveUser() user: UserEntity,
    @Query('enabled', ParseBoolPipe) enabled: boolean,
  ): Promise<boolean> {
    await this.userService.updateNotificationSettings(user.id, enabled);

    return true;
  }

  @ApiBooleanResponse()
  @ApiDescription({
    tags: ['알림'],
    summary: '디바이스 토큰 등록/업데이트',
    description: `
    - 매번 사용자 로그인 성공 직후 
    - 푸시 알림 권한을 사용자가 허용한 직후
    - 앱이 새로운 푸시 토큰을 받았을 때 (토큰 갱신)`,
    auth: AuthorizationToken.BearerUserToken,
  })
  @HttpCode(HttpStatus.OK)
  @Post('device-token')
  async registerDeviceToken(
    @ActiveUser() user: UserEntity,
    @Body() params: RegisterDeviceTokenDto,
  ): Promise<boolean> {
    await this.notificationService.registerDeviceToken(user.id, params);

    return true;
  }

  @ApiBooleanResponse()
  @ApiDescription({
    tags: ['알림'],
    summary: '디바이스 토큰 비활성화',
    description: '로그아웃시 호출',
    auth: AuthorizationToken.BearerUserToken,
    exceptions: [ContentNotFoundError],
  })
  @Patch('device-token/deactivate')
  async deactivateDevice(
    @ActiveUser() user: UserEntity,
    @Body() params: DeactivateDeviceDto,
  ): Promise<boolean> {
    await this.notificationService.deactivateDeviceByUser(
      user.id,
      params.deviceToken,
    );

    return true;
  }

  @Auth(AuthType.None)
  @ApiBooleanResponse()
  @ApiDescription({
    tags: ['알림'],
    summary: '알림 전송(테스트용)',
    exceptions: [ContentNotFoundError],
  })
  @HttpCode(HttpStatus.OK)
  @Post('send-notification-test')
  async sendNotificationTest(
    @Body() params: MessageRequestFormat,
  ): Promise<boolean> {
    await this.pushNotificationService.sendNotifications(params);

    return true;
  }
}
