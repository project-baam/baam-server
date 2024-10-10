export interface NotificationResult {
  token: string;
  status: 'success' | 'error';
  messageId?: string;
  message?: string;
}
