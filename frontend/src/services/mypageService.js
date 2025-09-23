import { BaseService } from './baseService';
import { mypageData } from '../mocks/mypageData';

class MypageService extends BaseService {
  constructor() {
    super(mypageData);
  }

  // 프로필 정보 조회
  async getProfile() {
    return this.request(
      () => this.apiCall('/api/user/profile'),
      'userProfile'
    );
  }

  // 요약 통계 조회
  async getSummaryStats() {
    return this.request(
      () => this.apiCall('/api/user/summary'),
      'summaryStats'
    );
  }

  // 학습 목표 조회
  async getLearningGoals() {
    return this.request(
      () => this.apiCall('/api/user/goals'),
      'learningGoals'
    );
  }

  // 학습 목표 업데이트
  async updateLearningGoals(goals) {
    return this.request(
      () => this.apiCall('/api/user/goals', {
        method: 'PUT',
        body: JSON.stringify(goals)
      }),
      null, // Mock key
      () => {
        // Mock 데이터 업데이트
        Object.assign(this.mockData.learningGoals, goals);
        return this.mockData.learningGoals;
      }
    );
  }

  // 학습 관리 메뉴 데이터 조회
  async getLearningManagement() {
    return this.request(
      () => this.apiCall('/api/user/learning-management'),
      'learningManagement'
    );
  }

  // 아바타 시스템 데이터 조회
  async getAvatarSystem() {
    return this.request(
      () => this.apiCall('/api/user/avatar-system'),
      'avatarSystem'
    );
  }

  // 아바타 변경
  async updateAvatar(avatar) {
    return this.request(
      () => this.apiCall('/api/user/avatar', {
        method: 'PUT',
        body: JSON.stringify({ avatar })
      }),
      null, // Mock key
      () => {
        // Mock 데이터 업데이트
        this.mockData.userProfile.avatar = avatar;
        this.mockData.avatarSystem.current = avatar;
        return { success: true, avatar };
      }
    );
  }

  // 앱 설정 토글
  async toggleAppSetting(settingId, value) {
    return this.request(
      () => this.apiCall('/api/user/app-settings', {
        method: 'PUT',
        body: JSON.stringify({ [settingId]: value })
      }),
      null, // Mock key
      () => {
        // Mock 데이터에서 해당 설정 찾아서 업데이트
        const setting = this.mockData.appSettings.find(s => s.id === settingId);
        if (setting) {
          setting.value = value;
        }
        return { success: true, settingId, value };
      }
    );
  }

  // 로그아웃
  async logout() {
    return this.request(
      () => this.apiCall('/api/auth/logout', { method: 'POST' }),
      null, // Mock key
      () => {
        // 실제로는 토큰 삭제 등의 작업 수행
        localStorage.removeItem('token');
        return { success: true };
      }
    );
  }

  // 실제 API 호출 (향후 구현)
  async apiCall(endpoint, options = {}) {
    // TODO: 실제 API 호출 로직
    throw new Error('API not implemented yet');
  }
}

export const mypageService = new MypageService();