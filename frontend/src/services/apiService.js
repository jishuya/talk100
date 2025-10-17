// 통합 API 서비스 - Vite 환경 변수 직접 사용

// Mock 데이터 import
import { MOCK_HOME_DATA } from '../mocks/homePageData';
import { mypageData } from '../mocks/mypageData';
import { MOCK_QUIZ_DATA } from '../mocks/quizPageData';
import { settingsData } from '../mocks/settingsData';
import { statisticsData } from '../mocks/statisticsData';

// Mock 데이터 통합 - 실제 키들과 매핑
const MOCK_DATA = {
  // HomePageData 키들
  user: MOCK_HOME_DATA.user,
  progress: MOCK_HOME_DATA.progress,
  badges: MOCK_HOME_DATA.badges,
  categories: MOCK_HOME_DATA.categories,
  personalQuizzes: MOCK_HOME_DATA.personalQuizzes,
  history: MOCK_HOME_DATA.history,

  // MypageData 키들
  mypageData: mypageData,

  // QuizData 키들
  quizSession: MOCK_QUIZ_DATA, // 레거시 지원
  quizData: MOCK_QUIZ_DATA, // Day별 전체 문제 데이터

  // SettingsData 키들
  settings: settingsData,

  // StatisticsData 키들 - 세분화된 매핑
  statistics: statisticsData,
  weeklyData: statisticsData.weeklyPattern,
  categoryStats: statisticsData.categoryProgress,
  learningPattern: statisticsData.learningPattern,

  // 추가 별칭들
  dailyProgress: MOCK_HOME_DATA.progress
};

// 통합 API 서비스 클래스
class ApiService {
  constructor() {
    this.mockData = MOCK_DATA;
  }

  // Mock/실제 API 전환 로직 (서버 통신 실패 시 자동 fallback)
  async request(endpoint, mockKey, options = {}) {
    const mockData = this.getMockData(mockKey);

    // 1. Mock 모드인 경우 Mock 데이터 반환
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
      if (mockData) {
        console.log(`🔧 [Mock Mode] Using mock data for ${mockKey}`);
        return this.simulateNetworkDelay(mockData, options.delay || 500);
      } else {
        console.warn(`⚠️ [Mock Mode] Mock 데이터를 찾을 수 없습니다: ${mockKey}`);
        throw new Error(`Mock 데이터를 찾을 수 없습니다: ${mockKey}`);
      }
    }

    // 2. 실제 API 호출 시도
    try {
      console.log(`🌐 [API] Calling ${endpoint}`);
      const result = await this.apiCall(endpoint, options);
      console.log(`✅ [API] Success: ${endpoint}`);
      return result;
    } catch (error) {
      console.error(`❌ [API] Failed: ${endpoint}`, error.message);

      // 3. API 실패시 Mock 데이터로 자동 fallback
      if (mockData) {
        console.log(`🔄 [Fallback] Using mock data for ${mockKey} due to API failure`);
        return this.simulateNetworkDelay(mockData, options.delay || 300);
      }

      // 4. Mock 데이터도 없으면 에러 발생
      console.error(`💥 [Error] No fallback data available for ${mockKey}`);
      throw this.handleError(error);
    }
  }

  // Mock 데이터 가져오기
  getMockData(key) {
    return key ? this.mockData[key] : null;
  }

  // 네트워크 지연 시뮬레이션
  simulateNetworkDelay(data, delay) {
    return new Promise(resolve => setTimeout(() => resolve(data), delay));
  }

  // 실제 API 호출 (JWT 토큰 자동 첨부 및 향상된 에러 처리)
  async apiCall(endpoint, options = {}) {
    const url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${endpoint}`;
    const token = localStorage.getItem('jwt_token');

    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: 'include', // 쿠키 포함
      timeout: 10000, // 10초 타임아웃
      ...options,
    };

    // body가 있는 경우에만 JSON 변환
    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    let response;
    try {
      // 네트워크 타임아웃 처리
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      response = await fetch(url, {
        ...config,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        throw new Error('서버 응답 시간이 초과되었습니다');
      }
      throw new Error(`네트워크 연결 오류: ${fetchError.message}`);
    }

    // HTTP 상태 코드별 에러 처리
    if (!response.ok) {
      if (response.status === 401) {
        // 토큰 만료 또는 인증 오류
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_info');
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      } else if (response.status === 403) {
        throw new Error('접근 권한이 없습니다.');
      } else if (response.status === 404) {
        throw new Error('요청한 리소스를 찾을 수 없습니다.');
      } else if (response.status >= 500) {
        throw new Error('서버에 일시적인 문제가 발생했습니다.');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }

    let jsonResponse;
    try {
      jsonResponse = await response.json();
    } catch {
      throw new Error('서버 응답을 처리할 수 없습니다.');
    }

    // 백엔드 응답이 { success: true, data: {...} } 구조인 경우 data만 추출
    if (jsonResponse.success && jsonResponse.data) {
      return jsonResponse.data;
    }

    // 백엔드에서 에러를 반환한 경우
    if (jsonResponse.success === false) {
      throw new Error(jsonResponse.message || '서버에서 오류가 발생했습니다.');
    }

    // 그렇지 않으면 전체 응답 반환
    return jsonResponse;
  }

  // 에러 처리
  handleError(error) {
    console.error('🚨 [API Error]', error);

    // 인증 오류 - 로그인 페이지로 리다이렉트
    if (error.message?.includes('인증이 만료') || error.message?.includes('401')) {
      console.log('🔄 [Redirect] Redirecting to login page');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
      return new Error('인증이 만료되었습니다. 로그인 페이지로 이동합니다.');
    }

    // 네트워크 연결 오류
    if (error.message?.includes('네트워크') || error.message?.includes('Failed to fetch')) {
      return new Error('인터넷 연결을 확인해주세요.');
    }

    // 서버 오류 (5xx)
    if (error.message?.includes('서버에') || error.message?.includes('5')) {
      return new Error('서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }

    // 타임아웃 오류
    if (error.message?.includes('시간이 초과')) {
      return new Error('요청 시간이 초과되었습니다. 네트워크 상태를 확인해주세요.');
    }

    // 기본 에러 메시지
    return new Error(error.message || '알 수 없는 오류가 발생했습니다.');
  }

  // ==============================================
  // 📱 HomePage - 홈 화면 관련 API
  // ==============================================

  // 🏠 HomePage.jsx에서 사용 - 사용자 기본 정보 (프로필, 이름, 레벨 등)
  getUser() {
    return this.request('/api/users/profile', 'user');
  }

  // 🏠 HomePage.jsx에서 사용 - 뱃지 정보 (학습일수, 문제수 등)
  getBadges() {
    return this.request('/api/users/badges', 'badges');
  }

  // 🏠 HomePage.jsx에서 사용 - 학습 진행률 (현재/전체 진행도)
  getProgress() {
    return this.request('/api/users/progress', 'progress');
  }

  // 🏠 HomePage.jsx > StudyHistorySection에서 사용 - 최근 학습 기록
  getHistory() {
    return this.request('/api/users/history', 'history');
  }

  // 🏠 HomePage.jsx에서 사용 - 개인 퀴즈 데이터 (즐겨찾기, 틀린문제 개수 포함)
  getPersonalQuizzes() {
    return this.request('/api/users/personal-quizzes', 'personalQuizzes');
  }

  // ==============================================
  // 🧩 QuizPage - 퀴즈 관련 API
  // ==============================================

  // 🧩 QuizPage.jsx에서 사용 - Day별 전체 문제 조회
  getQuestions(category, day) {
    return this.request(`/api/quiz/questions?category=${category}&day=${day}`, 'quizData');
  }

  // 🧩 QuizPage.jsx에서 사용 - 특정 문제 조회
  getQuestion(questionId) {
    return this.request(`/api/quiz/question/${questionId}`, null);
  }

  // 🧩 QuizPage.jsx에서 사용 - 카테고리별 Day 범위 조회
  getDayRange(category) {
    return this.request(`/api/quiz/day-range?category=${category}`, null);
  }

  // 🧩 QuizPage.jsx에서 사용 - 즐겨찾기 문제 조회
  getFavoriteQuestions() {
    return this.request('/api/quiz/favorites', null);
  }

  // 🧩 QuizPage.jsx에서 사용 - 틀린 문제 조회
  getWrongAnswerQuestions() {
    return this.request('/api/quiz/wrong-answers', null);
  }

  // 🧩 QuizPage.jsx에서 사용 - 퀴즈 세션 데이터 (문제, 진행상황 등) - 레거시
  getQuizSession(sessionId) {
    return this.request(`/api/quiz/session/${sessionId}`, 'quizSession');
  }

  // 🧩 QuizPage.jsx에서 사용 - 답변 제출 및 채점
  submitAnswer(data) {
    return this.request('/api/quiz/answer', null, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 🧩 QuizPage.jsx에서 사용 - 진행률 업데이트
  updateProgress(data) {
    return this.request('/api/progress', null, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 🧩 QuizPage.jsx에서 사용 - 틀린 문제 토글 (별 아이콘)
  toggleWrongAnswer(questionId, isStarred) {
    return this.request('/api/quiz/wrong-answers/toggle', null, {
      method: 'POST',
      body: { questionId, isStarred }
    });
  }

  // 🧩 QuizPage.jsx에서 사용 - 즐겨찾기 토글 (하트 아이콘)
  toggleFavorite(questionId, isFavorite) {
    return this.request('/api/quiz/favorites/toggle', null, {
      method: 'POST',
      body: { questionId, isFavorite }
    });
  }

  // ==============================================
  // 👤 MyPage - 마이페이지 관련 API
  // ==============================================

  // 👤 MyPage.jsx에서 사용 - 마이페이지 전체 데이터
  getMypageData() {
    return this.request('/api/mypage', 'mypageData');
  }

  // 👤 MyPage.jsx에서 사용 - 목표 설정 업데이트
  updateGoals(data) {
    return this.request('/api/mypage/goals', null, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // 👤 MyPage.jsx에서 사용 - 아바타 업데이트
  updateAvatar(data) {
    return this.request('/api/mypage/avatar', null, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // 👤 MyPage.jsx에서 사용 - 프로필 정보 업데이트
  updateProfile(data) {
    return this.request('/api/users/profile', null, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // ==============================================
  // ⚙️ SettingsPage - 설정 페이지 관련 API
  // ==============================================

  // ⚙️ SettingsPage.jsx에서 사용 - 설정 정보 조회
  getSettings() {
    return this.request('/api/settings', 'settings');
  }

  // ⚙️ SettingsPage.jsx에서 사용 - 설정 정보 업데이트
  updateSettings(data) {
    return this.request('/api/settings', null, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // ==============================================
  // 📊 StatusPage - 통계 페이지 관련 API
  // ==============================================

  // 📊 StatusPage.jsx에서 사용 - 전체 통계 데이터 (기간별)
  getStatistics(period = '7days') {
    return this.request(`/api/stats?period=${period}`, 'statistics');
  }

  // 📊 StatusPage.jsx에서 사용 - 주간 차트 데이터
  getWeeklyChart() {
    return this.request('/api/stats/weekly', 'weeklyData');
  }

  // 📊 StatusPage.jsx에서 사용 - 카테고리별 진행률
  getCategoryProgress() {
    return this.request('/api/stats/categories', 'categoryStats');
  }

  // 📊 StatusPage.jsx에서 사용 - 학습 패턴 분석
  getLearningPattern() {
    return this.request('/api/stats/pattern', 'learningPattern');
  }

  // ==============================================
  // 🔍 공통/기타 API (여러 페이지에서 사용)
  // ==============================================

  // 📊 StatusPage.jsx에서도 사용 - 일일 진행률
  getDailyProgress() {
    return this.request('/api/progress/daily', 'dailyProgress');
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const api = new ApiService();