import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';

import jwtConfig from './config/jwt.config';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { UserModule } from '../user/user.module';
import { AuthenticationGuard } from './guards/authentication.guard';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenIdsStorage } from './refresh-token-ids.storage';

@Module({
  imports: [JwtModule.registerAsync(jwtConfig.asProvider()), UserModule],
  providers: [
    AuthenticationService,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    AccessTokenGuard,
    RefreshTokenIdsStorage,
  ],
  controllers: [AuthenticationController],
})
export class IamModule {}
// Iam = identity and access management
