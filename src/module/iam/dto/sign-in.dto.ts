import { IsEmail, MinLength } from 'class-validator';
import { PASSWORD_MIN_LENGTH } from '../constants/authentication';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { UserEntity } from 'src/module/user/adapter/persistence/orm/entities/user.entity';
import { GetUserResponse } from './../../user/adapter/presenter/rest/dto/user.dto';

export class SignInDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @MinLength(PASSWORD_MIN_LENGTH)
  password: string;
}

// access token payload
export class ActiveUserData {
  @Expose()
  sub: number; // user id

  @Expose()
  email: string;
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
  @ApiProperty({ type: GetUserResponse })
  @Expose()
  user: GetUserResponse;

  constructor(user: UserEntity, jwts: JWT) {
    super();
    this.user = user;
    this.accessToken = jwts.accessToken;
    this.refreshToken = jwts.refreshToken;
  }
}
