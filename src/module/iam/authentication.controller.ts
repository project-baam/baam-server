import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthenticationService } from './authentication.service';
import { AuthType } from './enums/auth-type.enum';
import { Auth } from './decorators/auth.decorator';
import { ExternalLoginRequest, JWT, SignInResponse } from './dto/sign-in.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import {
  IncorrectLoginInfo,
  InvalidatedRefreshTokenError,
} from 'src/common/types/error/application-exceptions';
import { ApiDescription } from 'src/docs/decorator/api-description.decorator';
import { LoginType } from './constants/sign-in';
import { RestApi } from 'src/common/decorator/rest-api.decorator';

@ApiTags('authentication')
@Auth(AuthType.None) // public route
@RestApi('authentication')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @ApiDescription({
    summary: '로그인',
    exceptions: [IncorrectLoginInfo],
    dataResponse: {
      status: HttpStatus.OK,
      schema: SignInResponse,
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post(LoginType.Kakao)
  async signIn(
    @Body() signInDto: ExternalLoginRequest,
  ): Promise<SignInResponse> {
    return await this.authService.signIn(signInDto);
  }

  @ApiDescription({
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
