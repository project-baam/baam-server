export interface SocialStrategyInterface {
  authenticate(token: string): Promise<any>;
}
