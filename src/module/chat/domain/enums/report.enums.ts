export enum ReportStatus {
  PENDING = 'pending', // 신고 접수 완료, 검토 대기
  REVIEWED = 'reviewed', // 신고 검토 완료, 최종 결정 대기
  RESOLVED = 'resolved', // 신고 처리 완료(조치 완료)
}

export enum AdminDecision {
  INAPPROPRIATE = 'inappropriate', // 부적절한 내용
  APPROPRIATE = 'appropriate', // 문제 없는 내용
  INCONCLUSIVE = 'inconclusive', // 판단이 어려운 경우
}
