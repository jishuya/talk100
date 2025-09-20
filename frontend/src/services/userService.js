import { BaseService } from './baseService';
import { MOCK_HOME_DATA } from '../mocks/homePageData';

class UserService extends BaseService {
  constructor() {
    super(MOCK_HOME_DATA);  // 부모에서 Mock데이터 전달
  }

  // 사용자 프로필 정보 조회: (첫번째인자:API호출함수, 두번째인자 Mocke데이터키)
  async getProfile() {
    return this.request(
      () => this.apiCall('/api/users/profile'),
      'user'
    );
  }

  // 사용자 뱃지 정보 조회
  async getBadges() {
    return this.request(
      () => this.apiCall('/api/users/badges'),
      'badges'
    );
  }

  // 실제 API 호출 (향후 구현)
  async apiCall(endpoint) {
    // TODO: 실제 API 호출 로직
    throw new Error('API not implemented yet');
  }
}

export const userService = new UserService();