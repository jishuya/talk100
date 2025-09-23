import { BaseService } from './baseService';
import { statisticsData } from '../mocks/statisticsData';

class StatisticsService extends BaseService {
  constructor() {
    super(statisticsData);
  }
  // 전체 통계 요약
  async getSummaryStats(period = 'week') {
    return this.request(
      () => this.apiCall(`/api/statistics/summary?period=${period}`),
      `summaryStats.${period}`
    );
  }

  // 연속 학습 데이터
  async getStreakData() {
    return this.request(
      () => this.apiCall('/api/statistics/streak'),
      'streakData'
    );
  }

  // 주간 출석 패턴
  async getWeeklyPattern(period = 'week') {
    return this.request(
      () => this.apiCall(`/api/statistics/weekly-pattern?period=${period}`),
      `weeklyPattern.${period}`
    );
  }

  // 카테고리별 진행률
  async getCategoryProgress() {
    return this.request(
      () => this.apiCall('/api/statistics/category-progress'),
      'categoryProgress'
    );
  }

  // 학습 패턴 분석
  async getLearningPattern(period = 'week') {
    return this.request(
      () => this.apiCall(`/api/statistics/learning-pattern?period=${period}`),
      `learningPattern.${period}`
    );
  }

  // 성취 뱃지
  async getBadges() {
    return this.request(
      () => this.apiCall('/api/statistics/badges'),
      'badges'
    );
  }

  // 실제 API 호출 (향후 구현)
  async apiCall() {
    // TODO: 실제 API 호출 로직
    throw new Error('API not implemented yet');
  }
}

export const statisticsService = new StatisticsService();