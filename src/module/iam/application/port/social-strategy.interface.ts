export interface SocialStrategy {
  authenticate(token: string): Promise<any>;
}
