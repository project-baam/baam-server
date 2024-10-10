export class FcmTokenValidator {
  private static readonly MIN_LENGTH = 100;
  private static readonly MAX_LENGTH = 300;
  // TODO:
  //   private static readonly TOKEN_PATTERN = /^[A-Za-z0-9_-]+$/;

  static validate(token: string): boolean {
    return (
      token.length >= this.MIN_LENGTH && token.length <= this.MAX_LENGTH
      //   this.TOKEN_PATTERN.test(token)
    );
  }
}
