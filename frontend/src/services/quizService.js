import { BaseService } from './baseService';
import { MOCK_HOME_DATA } from '../mocks/homePageData';

class QuizService extends BaseService {
  constructor() {
    super(MOCK_HOME_DATA);
  }

  // 퀴즈 카테고리 목록 조회
  async getCategories() {
    return this.request(
      () => this.apiCall('/api/quiz/categories'),
      'categories'
    );
  }

  // 개인 퀴즈 (틀린문제, 즐겨찾기) 조회
  async getPersonalQuizzes() {
    return this.request(
      () => this.apiCall('/api/quiz/personal'),
      'personalQuizzes'
    );
  }

  // 실제 API 호출 (향후 구현)
  async apiCall(endpoint) {
    // TODO: 실제 API 호출 로직
    throw new Error('API not implemented yet');
  }
}

export const quizService = new QuizService();