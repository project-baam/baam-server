import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { SignInProvider } from 'src/module/iam/domain/enums/sign-in-provider.enum';
import { User } from 'src/module/user/domain/user';
import { UserMapper } from 'src/module/user/adapter/presenter/rest/mappers/user.mapper';
import { UserEntity } from 'src/module/user/adapter/persistence/orm/entities/user.entity';

export class SignInRequest {
  @ApiProperty({ description: '인증 서버에서 발급 받은 코드' })
  @IsString()
  code: string;

  @ApiProperty({
    type: 'enum',
    enum: SignInProvider,
    description: '로그인 타입',
  })
  @IsEnum(SignInProvider)
  provider: SignInProvider;
}

export class AccessTokenPayload {
  @Expose()
  sub: number; // user id

  @Expose()
  provider: SignInProvider;
}

export class RefreshTokenPayload {
  sub: number;
  refreshTokenId: string;
}
export class JWT {
  @ApiProperty({
    description: `expiration time: ${process.env.JWT_ACCESS_TOKEN_TTL}`,
  })
  @Expose()
  accessToken: string;

  @ApiProperty({
    description: `expiration time: ${process.env.JWT_REFRESH_TOKEN_TTL}`,
  })
  @Expose()
  refreshToken: string;
}

export class SignInResponse extends JWT {
  @ApiProperty({ type: User })
  @Expose()
  user: User;

  constructor(user: UserEntity, jwts: JWT) {
    super();
    this.user = UserMapper.toDomain(user);
    this.accessToken = jwts.accessToken;
    this.refreshToken = jwts.refreshToken;
  }
}
