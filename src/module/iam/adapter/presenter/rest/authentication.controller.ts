import {
  Body,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { AuthenticationService } from '../../../application/authentication.service';
import { AuthType } from '../../../domain/enums/auth-type.enum';
import { Auth } from './decorators/auth.decorator';
import {
  IncorrectLoginInfo,
  InvalidatedRefreshTokenError,
} from 'src/common/types/error/application-exceptions';
import { ApiDescription } from 'src/docs/decorator/api-description.decorator';
import { RestApi } from 'src/common/decorator/rest-api.decorator';
import { JWT, SignInRequest, SignInResponse } from './dto/sign-in.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Auth(AuthType.None) // public route
@RestApi('authentication')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @ApiDescription({
    tags: ['Authentication'],
    summary: '로그인',
    exceptions: [IncorrectLoginInfo],
    dataResponse: {
      status: HttpStatus.OK,
      schema: SignInResponse,
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post()
  async signIn(@Body() signInDto: SignInRequest): Promise<SignInResponse> {
    return await this.authService.signInOrSignUp(signInDto);
  }

  @ApiDescription({
    tags: ['Authentication'],
    summary: '카카오 로그인 콜백(테스트용)',
  })
  @Get('kakao/callback')
  async kakaoCallback(@Query() query: any, @Param() params: any) {
    return {
      query,
      params,
    };
  }

  @ApiDescription({
    tags: ['Authentication'],
    summary: '액세스 토큰 재발급',
    exceptions: [InvalidatedRefreshTokenError],
    dataResponse: {
      status: HttpStatus.OK,
      schema: JWT,
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('refresh-tokens')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto): Promise<JWT> {
    return await this.authService.refreshTokens(refreshTokenDto);
  }
}
