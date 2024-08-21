export class AppleTokenResponse {
  iss: string;
  sub: string;
  aud: string;
  iat: number;
  exp: number;
  nonce: string;
  nonce_supported: boolean;
  email: string;
  email_verified: string;
  is_private_email: string;
  real_user_status: number;
  transfer_sub: string;
}
