import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { SignInProvider } from 'src/module/iam/domain/enums/sign-in-provider.enum';
import { UserStatus } from 'src/module/user/domain/enum/user-status.enum';

export class GetUserResponse {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  status: UserStatus;

  @ApiProperty()
  @Expose()
  provider: SignInProvider;
}
