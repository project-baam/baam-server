import { Get, HttpStatus } from '@nestjs/common';

import { AuthorizationToken } from 'src/docs/constant/authorization-token';
import { ActiveUser } from 'src/module/iam/adapter/presenter/rest/decorators/active-user.decorator';
import { RestApi } from 'src/common/decorator/rest-api.decorator';
import { UserService } from 'src/module/user/application/user.service';
import { ApiDescription } from 'src/docs/decorator/api-description.decorator';
import { User } from 'src/module/user/domain/user';
import { UserEntity } from '../../persistence/orm/entities/user.entity';
import { UserMapper } from './mappers/user.mapper';

@RestApi('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiDescription({
    tags: ['User'],
    summary: '로그인한 유저 프로필 조회',
    auth: AuthorizationToken.BearerUserToken,
    dataResponse: {
      status: HttpStatus.OK,
      schema: User,
    },
  })
  @Get()
  async getUser(@ActiveUser() user: UserEntity): Promise<User> {
    return UserMapper.toDomain(user);
  }
}
