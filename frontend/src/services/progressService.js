import { BaseService } from './baseService';
import { MOCK_HOME_DATA } from '../mocks/homePageData';

class ProgressService extends BaseService {
  constructor() {
    super(MOCK_HOME_DATA);
  }

  // 현재 진행률 조회
  async getCurrentProgress() {
    return this.request(
      () => this.apiCall('/api/progress/user'),
      'progress'
    );
  }

  // 학습 기록 조회
  async getStudyHistory(limit = 10) {
    return this.request(
      () => this.apiCall(`/api/progress/history?limit=${limit}`),
      'history'
    );
  }

  // 실제 API 호출 (향후 구현)
  async apiCall(endpoint) {
    // TODO: 실제 API 호출 로직
    throw new Error('API not implemented yet');
  }
}

export const progressService = new ProgressService();