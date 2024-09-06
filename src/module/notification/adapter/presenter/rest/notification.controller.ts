import { UserService } from 'src/module/user/application/user.service';
import { ActiveUser } from 'src/module/iam/adapter/presenter/rest/decorators/active-user.decorator';
import { ParseBoolPipe, Patch, Query } from '@nestjs/common';
import { UserEntity } from 'src/module/user/adapter/persistence/orm/entities/user.entity';
import { ApiBooleanResponse } from 'src/docs/decorator/api-boolean-response';
import { ApiDescription } from 'src/docs/decorator/api-description.decorator';
import { AuthorizationToken } from 'src/docs/constant/authorization-token';

export class NotificationController {
  constructor(private readonly userService: UserService) {}

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
}
