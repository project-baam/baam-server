/**
 * 푸시 알림 실패 횟수, 시간 설정
 * 24시간 내 5번 이상 실패하면 푸시 알림을 비활성화
 */
export const PushNotificationConfig = {
  FAILURE_CHECK_HOURS: 24,
  MAX_FAILURE_COUNT: 5,
};
