import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthenticationService } from './authentication.service';
import { AuthType } from './enums/auth-type.enum';
import { Auth } from './decorators/auth.decorator';
import { SignUpDto, SignUpResonse } from './dto/sign-up.dto';
import { JWT, SignInDto, SignInResponse } from './dto/sign-in.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResponseData } from 'src/common/decorator/response-data.decorator';
import { HttpController } from './decorators/http-controller.decorator';

@ApiTags('authentication')
@Auth(AuthType.None) // public route
@HttpController('authentication')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @ApiOperation({ summary: '회원 가입' })
  @Post('sign-up')
  @ResponseData(SignUpResonse)
  async signUp(@Body() signUpDto: SignUpDto): Promise<SignUpResonse> {
    return await this.authService.signUp(signUpDto);
  }

  @ApiOperation({ summary: '로그인' })
  @ResponseData(SignInResponse)
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto): Promise<SignInResponse> {
    return await this.authService.signIn(signInDto);
  }

  @ApiOperation({ summary: '액세스 토큰 재발급' })
  @ResponseData(JWT)
  @HttpCode(HttpStatus.OK)
  @Post('refresh-tokens')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto): Promise<JWT> {
    return await this.authService.refreshTokens(refreshTokenDto);
  }
}
