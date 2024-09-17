import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';

import jwtConfig from '../adapter/external/config/jwt.config';
import { AuthenticationController } from '../adapter/presenter/rest/authentication.controller';
import { AuthenticationService } from './authentication.service';
import { UserModule } from '../../user/user.module';
import { AuthenticationGuard } from '../adapter/presenter/rest/guards/authentication.guard';
import { AccessTokenGuard } from '../adapter/presenter/rest/guards/access-token.guard';
import { RefreshTokenIdsStorage } from '../adapter/persistence/in-memory/refresh-token-ids.storage';
import { KakaoAuth } from '../adapter/external/social/kakao-auth';
import { HttpModule } from '@nestjs/axios';
import { OrmUserPersistenceModule } from 'src/module/user/adapter/persistence/orm/orm-user-persistence.module';
import { AppleAuth } from '../adapter/external/social/apple-auth';

@Module({
  imports: [
    HttpModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    UserModule,
    OrmUserPersistenceModule,
  ],
  providers: [
    AuthenticationService,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    AccessTokenGuard,
    RefreshTokenIdsStorage,
    KakaoAuth,
    AppleAuth,
  ],
  controllers: [AuthenticationController],
  exports: [AuthenticationService],
})
export class IamModule {}
// Iam = identity and access management
