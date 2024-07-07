import { Get, HttpStatus } from '@nestjs/common';

import { AuthorizationToken } from 'src/docs/constant/authorization-token';
import { ActiveUser } from 'src/module/iam/decorators/active-user.decorator';
import { HttpController } from 'src/module/iam/decorators/http-controller.decorator';
import { ActiveUserData } from 'src/module/iam/dto/sign-in.dto';
import { UserService } from 'src/module/user/application/user.service';
import { GetUserResponse } from './dto/user.dto';
import { ApiDescription } from 'src/common/decorator/api-description.decorator';

@HttpController('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiDescription({
    summary: '로그인한 유저 정보 조회',
    auth: AuthorizationToken.BearerUserToken,
    dataResponse: {
      status: HttpStatus.OK,
      schema: GetUserResponse,
    },
  })
  @Get()
  async getUser(@ActiveUser() userData: ActiveUserData) {
    const user = await this.userService.findOneByIdOrFail(userData.sub);

    return user;
  }
}
