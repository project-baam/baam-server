export const customCss = `
.swagger-ui .topbar {
  background-color: #f3b807; /* 부드러운 노란색 */
}

/* GET 메소드 색상 */
.swagger-ui .opblock-get .opblock-summary-method {
  background-color: #fdf6e3 !important; /* 연한 노란색 */
  color: black !important;
}

/* POST 메소드 색상 */
.swagger-ui .opblock-post .opblock-summary-method {
  background-color: #f5c300 !important; /* 중간 톤 노란색 */
  color: black !important;
}

/* PUT 메소드 색상 */
.swagger-ui .opblock-put .opblock-summary-method {
  background-color: #f4a300 !important; /* 약간 진한 노란색 */
  color: white !important;
}

/* DELETE 메소드 색상 */
.swagger-ui .opblock-delete .opblock-summary-method {
  background-color: #ea580c !important; /* 주황색 */
  color: white !important;
}

/* PATCH 메소드 색상 */
.swagger-ui .opblock-patch .opblock-summary-method {
  background-color: #fce9a6 !important; /* 부드러운 노란색 */
  color: black !important;
}

/* OPTIONS 메소드 색상 */
.swagger-ui .opblock-options .opblock-summary-method {
  background-color: #f9e7b1 !important; /* 연한 노란색 */
  color: black !important;
}

/* 기타 스타일 */
.swagger-ui .opblock-summary-method {
  border-radius: 10px; /* 둥근 모서리 */
  padding: 5px 10px; /* 박스 안의 텍스트 패딩 */
}

/* 상단 바 배경색 */
.swagger-ui .topbar { 
  background-color: #f3b807; /* 부드러운 노란색 */
}

/* 메인 설명 섹션 텍스트 */
.swagger-ui .info { 
  color: #f4a300; /* 약간 진한 노란색 */
}

/* API 블록 배경 */
.swagger-ui .opblock { 
  background-color: #fdf6e3; /* 연한 노란색 */
}

/* API 요청 버튼 색상 */
.swagger-ui .btn.execute { 
  background-color: #f5c300; /* 중간 톤 노란색 */
  color: black;
}

/* API 요청 상태 코드 블록 */
.swagger-ui .responses-inner h4 { 
  color: #f3b807; /* 부드러운 노란색 */
}

/* 일반 버튼 (예: Authorize) */
.swagger-ui .btn.authorize { 
  background-color: #f3b807; /* 부드러운 노란색 */
  border-radius: 10px; /* 둥근 모서리 */
}

/* 텍스트 박스 테두리 색상 */
.swagger-ui input[type="text"], .swagger-ui textarea { 
  border-color: #f3b807; /* 부드러운 노란색 */
}

/* 헤더 글씨 스타일 */
.swagger-ui .opblock-tag { 
  font-family: 'Comic Sans MS', cursive; /* 귀여운 폰트 */
  color: #f3b807; /* 부드러운 노란색 */
}

/* 첫 번째 엔드포인트의 배경색 변경 */
.swagger-ui .opblock:nth-child(1) {
  background-color: #fdf6e3; /* 연한 노란색 */
}

/* 두 번째 엔드포인트의 텍스트 색상 변경 */
.swagger-ui .opblock:nth-child(2) .opblock-summary {
  color: #f3b807; /* 부드러운 노란색 */
}

/* 특정 HTTP 메소드 별 스타일 (POST 요청의 버튼 색상) */
.swagger-ui .opblock-post .opblock-summary-method {
  background-color: #f5c300; /* 중간 톤 노란색 */
  color: black;
}

/* 특정 엔드포인트의 제목 텍스트 꾸미기 */
.swagger-ui .opblock:nth-child(1) .opblock-summary-path {
  font-family: 'Comic Sans MS', cursive; /* 귀여운 폰트 */
  font-size: 18px;
  color: #f4a300; /* 약간 진한 노란색 */
}
`;
