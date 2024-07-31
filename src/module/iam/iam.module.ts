import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';

import jwtConfig from './config/jwt.config';
import { AuthenticationController } from './adapter/presenter/rest/authentication.controller';
import { AuthenticationService } from './application/services/authentication.service';
import { UserModule } from '../user/user.module';
import { AuthenticationGuard } from './adapter/guards/authentication.guard';
import { AccessTokenGuard } from './adapter/guards/access-token.guard';
import { RefreshTokenIdsStorage } from './adapter/persistence/refresh-token-ids.storage';

import { KakaoStrategy } from './adapter/external/kakao.strategy';

@Module({
  imports: [JwtModule.registerAsync(jwtConfig), UserModule],
  providers: [
    AuthenticationService,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    AccessTokenGuard,
    RefreshTokenIdsStorage,
    {
      provide: 'KakaoStrategy',
      useClass: KakaoStrategy,
    },
  ],
  controllers: [AuthenticationController],
})
export class IamModule {}
