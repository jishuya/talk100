// 통합 API 서비스
import { ENV } from '../config/environment';

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
  session: MOCK_QUIZ_DATA.session,
  currentQuestion: MOCK_QUIZ_DATA.currentQuestion,
  quizSession: MOCK_QUIZ_DATA, // 전체 퀴즈 데이터

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

  // Mock/실제 API 전환 로직
  async request(endpoint, mockKey, options = {}) {

    const mockData = this.getMockData(mockKey);

    if (ENV.USE_MOCK_DATA && mockData) {
      // 개발 환경: Mock 데이터 반환
      return this.simulateNetworkDelay(mockData, options.delay || 500);
    }

    if (ENV.USE_MOCK_DATA && !mockData) {
      throw new Error(`Mock 데이터를 찾을 수 없습니다: ${mockKey}`);
    }

    // 프로덕션: 실제 API 호출
    try {
      return await this.apiCall(endpoint, options);
    } catch (error) {
      // API 실패시 Mock 데이터로 fallback
      if (mockData) {
        return mockData;
      }
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

  // 실제 API 호출
  async apiCall(endpoint, options = {}) {
    const url = `${ENV.API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('jwt_token');

    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const jsonResponse = await response.json();

    // 백엔드 응답이 { success: true, data: {...} } 구조인 경우 data만 추출
    if (jsonResponse.success && jsonResponse.data) {
      return jsonResponse.data;
    }

    // 그렇지 않으면 전체 응답 반환
    return jsonResponse;
  }

  // 에러 처리
  handleError(error) {
    if (error.message?.includes('401')) {
      window.location.href = '/login';
      return;
    }

    if (error.message?.includes('5')) {
      throw new Error('서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }

    throw new Error(error.message || '알 수 없는 오류가 발생했습니다.');
  }

  // ==============================================
  // 사용자 관련 API
  // ==============================================

  getUser() {
    return this.request('/api/users/profile', 'user');
  }

  getBadges() {
    return this.request('/api/users/badges', 'badges');
  }

  updateProfile(data) {
    return this.request('/api/users/profile', null, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // ==============================================
  // 진행률 관련 API
  // ==============================================

  getProgress() {
    return this.request('/api/progress', 'progress');
  }

  getDailyProgress() {
    return this.request('/api/progress/daily', 'dailyProgress');
  }

  updateProgress(data) {
    return this.request('/api/progress', null, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // ==============================================
  // 퀴즈 관련 API
  // ==============================================

  getQuizSession(categoryId) {
    return this.request(`/api/quiz/session/${categoryId}`, 'quizSession');
  }

  submitAnswer(data) {
    return this.request('/api/quiz/answer', null, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  getQuizHistory() {
    return this.request('/api/quiz/history', 'history');
  }

  // ==============================================
  // 마이페이지 관련 API
  // ==============================================

  getMypageData() {
    return this.request('/api/mypage', 'mypageData');
  }

  updateGoals(data) {
    return this.request('/api/mypage/goals', null, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  updateAvatar(data) {
    return this.request('/api/mypage/avatar', null, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // ==============================================
  // 설정 관련 API
  // ==============================================

  getSettings() {
    return this.request('/api/settings', 'settings');
  }

  updateSettings(data) {
    return this.request('/api/settings', null, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // ==============================================
  // 통계 관련 API
  // ==============================================

  getStatistics(period = '7days') {
    return this.request(`/api/stats?period=${period}`, 'statistics');
  }

  getWeeklyChart() {
    return this.request('/api/stats/weekly', 'weeklyData');
  }

  getCategoryProgress() {
    return this.request('/api/stats/categories', 'categoryStats');
  }

  getLearningPattern() {
    return this.request('/api/stats/pattern', 'learningPattern');
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const api = new ApiService();