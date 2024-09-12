export interface NotificationResult {
  token: string;
  status: 'success' | 'error';
  message?: string;
}
