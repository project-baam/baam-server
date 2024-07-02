import { Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ResponseData } from 'src/common/decorator/response-data.decorator';

import { AuthorizationToken } from 'src/docs/constant/authorization-token';
import { ActiveUser } from 'src/module/iam/decorators/active-user.decorator';
import { HttpController } from 'src/module/iam/decorators/http-controller.decorator';
import { ActiveUserData } from 'src/module/iam/dto/sign-in.dto';
import { UserService } from 'src/module/user/application/user.service';
import { GetUserResponse } from './dto/user.dto';

@HttpController('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '로그인한 유저 정보 조회' })
  @ResponseData(GetUserResponse)
  @ApiBearerAuth(AuthorizationToken.BearerUserToken)
  @Get()
  async getUser(@ActiveUser() userData: ActiveUserData) {
    const user = await this.userService.findOneByIdOrFail(userData.sub);

    return user;
  }
}
