//TODO: convert refresh token storage at memory to redis
export class RefreshTokenIdsStorage {
  private refreshTokenIds: Set<string> = new Set();

  add(refreshTokenId: string) {
    this.refreshTokenIds.add(refreshTokenId);
  }

  remove(refreshTokenId: string) {
    this.refreshTokenIds.delete(refreshTokenId);
  }

  contains(refreshTokenId: string): boolean {
    return this.refreshTokenIds.has(refreshTokenId);
  }
}
