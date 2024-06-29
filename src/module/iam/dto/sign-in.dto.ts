import { IsEmail, MinLength } from 'class-validator';
import { User } from 'src/module/user/domain/user';
import { PASSWORD_MIN_LENGTH } from '../constants/authentication';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

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
  accessToken: string;

  @ApiProperty({
    description: `expiration time: ${process.env.JWT_REFRESH_TOKEN_TTL}`,
  })
  refreshToken: string;
}

export class SignInResponse extends JWT {
  @ApiProperty({ type: OmitType(User, ['password']) })
  user: Omit<User, 'password'>;
}
