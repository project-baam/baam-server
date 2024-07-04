import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthenticationService } from './authentication.service';
import { AuthType } from './enums/auth-type.enum';
import { Auth } from './decorators/auth.decorator';
import { SignUpDto, SignUpResonse } from './dto/sign-up.dto';
import { JWT, SignInDto, SignInResponse } from './dto/sign-in.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { HttpController } from './decorators/http-controller.decorator';
import {
  DuplicateValueError,
  IncorrectLoginInfo,
  InvalidatedRefreshTokenError,
} from 'src/common/types/error/application-exceptions';
import { ApiDescription } from 'src/common/decorator/api-description.decorator';

@ApiTags('authentication')
@Auth(AuthType.None) // public route
@HttpController('authentication')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @ApiDescription({
    summary: '회원가입',
    description: '(예시) 유니크한 이메일 주소로 가입해야 합니다.',
    exceptions: [DuplicateValueError],
    dataResponse: {
      status: HttpStatus.CREATED,
      schema: SignUpResonse,
    },
  })
  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto): Promise<SignUpResonse> {
    return await this.authService.signUp(signUpDto);
  }

  @ApiDescription({
    summary: '로그인',
    exceptions: [IncorrectLoginInfo],
    dataResponse: {
      status: HttpStatus.OK,
      schema: SignInResponse,
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto): Promise<SignInResponse> {
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
