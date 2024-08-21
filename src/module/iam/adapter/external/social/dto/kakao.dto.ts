export interface KakaoTokenResponse {
  token_type: string; //	토큰 타입, bearer로 고정
  access_token: string; // 사용자 액세스 토큰 값
  id_token: string; // ID 토큰 값 OpenID Connect 확장 기능을 통해 발급되는 ID 토큰
  expires_in: number; // 액세스 토큰과 ID 토큰의 만료 시간(초)
  refresh_token: string; // 사용자 리프레시 토큰 값
  refresh_token_expires_in: number; // 리프레시 토큰 만료 시간(초)
  scope: string;
}

export interface KakaoTokenInfoResponse {
  id: number; //	회원번호
  expires_in: number; //	액세스 토큰 만료 시간(초)
  app_id: number; //  토큰이 발급된 앱 ID
}
