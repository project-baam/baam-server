import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthenticationService } from './authentication.service';
import { AuthType } from './enums/auth-type.enum';
import { Auth } from './decorators/auth.decorator';
import { SignUpDto, SignUpResonse } from './dto/sign-up.dto';
import { JWT, SignInDto, SignInResponse } from './dto/sign-in.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResponseData } from 'src/common/decorator/response-data.decorator';
import { ResponsesDataDto } from 'src/common/dto/responses-data.dto';
import { HttpController } from './decorators/http-controller.decorator';

@ApiTags('authentication')
@Auth(AuthType.None) // public route
@HttpController('authentication')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @ApiOperation({ summary: '회원 가입' })
  @Post('sign-up')
  @ResponseData(SignUpResonse)
  async signUp(
    @Body() signUpDto: SignUpDto,
  ): Promise<ResponsesDataDto<SignUpResonse>> {
    const signUpResult = await this.authService.signUp(signUpDto);

    return new ResponsesDataDto(signUpResult);
  }

  @ApiOperation({ summary: '로그인' })
  @ResponseData(SignInResponse)
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(
    @Body() signInDto: SignInDto,
  ): Promise<ResponsesDataDto<SignInResponse>> {
    const signInResult = await this.authService.signIn(signInDto);

    return new ResponsesDataDto(signInResult);
  }

  @ApiOperation({ summary: '액세스 토큰 재발급' })
  @ResponseData(JWT)
  @HttpCode(HttpStatus.OK)
  @Post('refresh-tokens')
  async refreshTokens(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<ResponsesDataDto<JWT>> {
    const newTokens = await this.authService.refreshTokens(refreshTokenDto);

    return new ResponsesDataDto(newTokens);
  }
}
