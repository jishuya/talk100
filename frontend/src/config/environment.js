// 환경 설정
// Runtime 환경 변수 지원 (Vercel 배포용)
// window._env_ 객체가 있으면 우선 사용, 없으면 빌드 타임 환경 변수 사용
const getApiBaseUrl = () => {
  // 1순위: Runtime injection (Vercel 배포 시)
  if (typeof window !== 'undefined' && window._env_?.VITE_API_BASE_URL) {
    return window._env_.VITE_API_BASE_URL;
  }

  // 2순위: 빌드 타임 환경 변수
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 3순위: 프로덕션 URL (fallback)
  return 'https://api.talk100.work';
};

export const ENV = {
  // 환경 변수에서 Mock 데이터 사용 여부 설정
  USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA === 'true',

  // API 기본 URL - Runtime에서도 동적으로 가져올 수 있도록 getter 사용
  get API_BASE_URL() {
    return getApiBaseUrl();
  },

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