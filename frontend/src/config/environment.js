// 환경 설정
export const ENV = {
  // 개발 환경에서는 Mock 데이터 사용, 프로덕션에서는 실제 API 사용
  USE_MOCK_DATA: false, // 실제 API 테스트를 위해 false로 변경

  // API 기본 URL
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',

  // 캐시 설정 (밀리초)
  CACHE_TIMES: {
    USER_DATA: 5 * 60 * 1000,      // 5분 - 사용자 정보
    PROGRESS: 30 * 1000,           // 30초 - 진행률 (자주 변함)
    CATEGORIES: 60 * 60 * 1000,    // 1시간 - 카테고리 (거의 안 변함)
    HISTORY: 2 * 60 * 1000,        // 2분 - 학습 기록
    QUIZ_SESSION: 30 * 1000,       // 30초 - 퀴즈 세션
    QUESTIONS: 5 * 60 * 1000,      // 5분 - 문제 데이터
    AUDIO: 60 * 60 * 1000,         // 1시간 - 오디오 URL
  }
};