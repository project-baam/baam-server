import { Body, Delete, Get, HttpStatus, Patch } from '@nestjs/common';

import { AuthorizationToken } from 'src/docs/constant/authorization-token';
import { ActiveUser } from 'src/module/iam/adapter/presenter/rest/decorators/active-user.decorator';
import { RestApi } from 'src/common/decorator/rest-api.decorator';
import { UserService } from 'src/module/user/application/user.service';
import { ApiDescription } from 'src/docs/decorator/api-description.decorator';
import { User } from 'src/module/user/domain/user';
import { UserEntity } from '../../persistence/orm/entities/user.entity';
import { UserMapper } from './mappers/user.mapper';
import { UpdateProfileRequest } from './dto/user.dto';
import { ApiBooleanResponse } from 'src/docs/decorator/api-boolean-response';

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

  @ApiDescription({
    tags: ['User'],
    summary: '유저 정보 업데이트',
    auth: AuthorizationToken.BearerUserToken,
    dataResponse: {
      status: HttpStatus.CREATED,
      schema: User,
    },
  })
  @Patch()
  async updateProfile(
    @ActiveUser() user: UserEntity,
    @Body() params: UpdateProfileRequest,
  ) {
    return this.userService.updateProfile(user.id, params);
  }

  // TODO: 기획 확인 필요
  @ApiBooleanResponse()
  @ApiDescription({
    tags: ['User'],
    summary: '탈퇴',
    auth: AuthorizationToken.BearerUserToken,
  })
  @Delete()
  async deleteUser(@ActiveUser() user: UserEntity) {
    await this.userService.delete(user.id);

    return true;
  }
}
