export const subjectShortForms: Record<string, string> = {
  '화법과 작문': '화작',
  '언어와 매체': '언·매',
  '실용 국어': '실·국',
  '심화 국어': '심·국',
  '고전 읽기': '고·읽',
  수학: '수학',
  '수학 I': '수 I',
  '수학 II': '수 II',
  미적분: '미적',
  '확률과 통계': '확통',
  '실용 수학': '실·수',
  '경제 수학': '경·수',
  '수학과제 탐구': '수·탐',
  '기본 수학': '기·수',
  '인공지능 수학': '인·수',
  '영어 I': '영 I',
  '영어 II': '영 II',
  '영어 회화': '영·회',
  '영어 독해와 작문': '영·작',
  '실용 영어': '실·영',
  '영어권 문화': '영·문',
  '영미 문학 읽기': '영미문',
  '진로 영어': '진·영',
  통합사회: '통·사',
  한국사: '한·사',
  한국지리: '한·지',
  세계지리: '세·지',
  세계사: '세계사',
  동아시아사: '동·사',
  경제: '경제',
  '정치와 법': '정·법',
  '사회·문화': '사·문',
  '생활과 윤리': '생·윤',
  '윤리와 사상': '윤·사',
  여행지리: '여·지',
  '사회문제 탐구': '사·탐',
  '고전과 윤리': '고·윤',
  통합과학: '통·과',
  과학탐구실험: '과탐실',
  '물리 I': '물 I',
  '화학 I': '화 I',
  '생명과학 I': '생 I',
  '지구과학 I': '지 I',
  과학사: '과학사',
  '생활과 과학': '생·과',
  융합과학: '융·과',
  '물리 II': '물 II',
  '화학 II': '화 II',
  '생명과학 II': '생 II',
  '지구과학 II': '지 II',
  '운동과 건강': '운·건',
  '스포츠 생활': '스·생',
  체육탐구: '체·탐',
  '음악 연주': '음·연',
  '음악 감상과 비평': '음·감',
  '미술 창작': '미·창',
  '미술 감상과 비평': '미·감',
  '중국어 I': '중I',
  '일본어 I': '일I',
  '독일어 I': '독I',
  '프랑스어 I': '프I',
  '스페인어 I': '스I',
  '러시아어 I': '러I',
  '아랍어 I': '아I',
  '베트남어 I': '베I',
  '중국어 II': '중II',
  '일본어 II': '일II',
  '독일어 II': '독II',
  '프랑스어 II': '프II',
  '스페인어 II': '스II',
  '러시아어 II': '러II',
  '아랍어 II': '아II',
  '베트남어 II': '베II',
  '한문 I': '한I',
  '한문 II': '한II',
  '기술·가정': '기·가',
  '농업 생명 과학': '농업',
  '공학 일반': '공학',
  '창의 경영': '창·경',
  '해양 문화와 기술': '해양',
  가정과학: '가정',
  '지식 재산 일반': '지식',
  '인공지능 기초': '인·기',
  논리학: '논리학',
  심리학: '심리학',
  교육학: '교육학',
  종교학: '종교학',
  '진로와 직업': '진로',
  '실용 경제': '실·경',
};

export function shortenSubject(subjectName: string): string {
  const normalizedName = subjectName.trim();

  // 미리 정의된 축약형이 있는 경우
  if (normalizedName in subjectShortForms) {
    return subjectShortForms[normalizedName];
  }

  // 기본 규칙 적용
  if (normalizedName.length <= 3) {
    return normalizedName;
  } else {
    return normalizedName.slice(0, 2);
  }
}
