import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { REQUEST_USER_KEY } from '../../../../domain/constants/authentication';
import { UserEntity } from 'src/module/user/adapter/persistence/orm/entities/user.entity';

export const ActiveUser = createParamDecorator((_, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user: UserEntity = request[REQUEST_USER_KEY];

  return user;
});
