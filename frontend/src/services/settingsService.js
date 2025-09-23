import { BaseService } from './baseService';
import { settingsData } from '../mocks/settingsData';

class SettingsService extends BaseService {
  constructor() {
    super(settingsData);
  }

  // 전체 설정 조회
  async getAllSettings() {
    return this.request(
      () => this.apiCall('/api/settings'),
      null, // Mock에서 직접 처리
      () => ({
        account: this.mockData.accountInfo,
        learning: this.mockData.learningSettings,
        notifications: this.mockData.notificationSettings,
        display: this.mockData.displaySettings,
        data: this.mockData.dataInfo
      })
    );
  }

  // 계정 설정 조회
  async getAccountSettings() {
    return this.request(
      () => this.apiCall('/api/settings/account'),
      'accountInfo'
    );
  }

  // 학습 설정 조회
  async getLearningSettings() {
    return this.request(
      () => this.apiCall('/api/settings/learning'),
      'learningSettings'
    );
  }

  // 알림 설정 조회
  async getNotificationSettings() {
    return this.request(
      () => this.apiCall('/api/settings/notifications'),
      'notificationSettings'
    );
  }

  // 화면 설정 조회
  async getDisplaySettings() {
    return this.request(
      () => this.apiCall('/api/settings/display'),
      'displaySettings'
    );
  }

  // 학습 설정 업데이트
  async updateLearningSettings(settings) {
    return this.request(
      () => this.apiCall('/api/settings/learning', {
        method: 'PUT',
        body: JSON.stringify(settings)
      }),
      null, // Mock key
      () => {
        Object.assign(this.mockData.learningSettings, settings);
        return this.mockData.learningSettings;
      }
    );
  }

  // 알림 설정 업데이트
  async updateNotificationSettings(settings) {
    return this.request(
      () => this.apiCall('/api/settings/notifications', {
        method: 'PUT',
        body: JSON.stringify(settings)
      }),
      null, // Mock key
      () => {
        Object.assign(this.mockData.notificationSettings, settings);
        return this.mockData.notificationSettings;
      }
    );
  }

  // 화면 설정 업데이트
  async updateDisplaySettings(settings) {
    return this.request(
      () => this.apiCall('/api/settings/display', {
        method: 'PUT',
        body: JSON.stringify(settings)
      }),
      null, // Mock key
      () => {
        Object.assign(this.mockData.displaySettings, settings);
        return this.mockData.displaySettings;
      }
    );
  }

  // 계정 정보 업데이트
  async updateAccountInfo(info) {
    return this.request(
      () => this.apiCall('/api/settings/account', {
        method: 'PUT',
        body: JSON.stringify(info)
      }),
      null, // Mock key
      () => {
        Object.assign(this.mockData.accountInfo, info);
        return this.mockData.accountInfo;
      }
    );
  }

  // 데이터 백업
  async backupData() {
    return this.request(
      () => this.apiCall('/api/settings/backup', { method: 'POST' }),
      null, // Mock key
      () => {
        this.mockData.dataInfo.lastBackup = new Date().toISOString().split('T')[0];
        return {
          success: true,
          message: '학습 기록이 백업되었습니다.',
          lastBackup: this.mockData.dataInfo.lastBackup
        };
      }
    );
  }

  // 데이터 내보내기
  async exportData() {
    return this.request(
      () => this.apiCall('/api/settings/export', { method: 'POST' }),
      null, // Mock key
      () => {
        // Mock CSV 데이터 생성
        const csvData = "Date,Category,Question,Answer,Score\n2024-12-08,Model Example,What's your name?,My name is John,85\n";
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);

        return {
          success: true,
          downloadUrl: url,
          filename: `talk100_export_${new Date().toISOString().split('T')[0]}.csv`
        };
      }
    );
  }

  // 캐시 삭제
  async clearCache() {
    return this.request(
      () => this.apiCall('/api/settings/cache', { method: 'DELETE' }),
      null, // Mock key
      () => {
        this.mockData.dataInfo.cacheSize = 0;
        return {
          success: true,
          message: '캐시가 삭제되었습니다.',
          cacheSize: 0
        };
      }
    );
  }

  // 학습 기록 초기화
  async resetProgress() {
    return this.request(
      () => this.apiCall('/api/settings/reset-progress', { method: 'POST' }),
      null, // Mock key
      () => {
        return {
          success: true,
          message: '학습 기록이 초기화되었습니다.'
        };
      }
    );
  }

  // 계정 삭제
  async deleteAccount(reason = '') {
    return this.request(
      () => this.apiCall('/api/settings/delete-account', {
        method: 'POST',
        body: JSON.stringify({ reason })
      }),
      null, // Mock key
      () => {
        return {
          success: true,
          message: '계정 삭제 요청이 접수되었습니다.\n24시간 내에 처리됩니다.'
        };
      }
    );
  }

  // 설정 옵션 조회
  async getSettingOptions() {
    return this.request(
      () => this.apiCall('/api/settings/options'),
      'settingOptions'
    );
  }

  // 실제 API 호출 (향후 구현)
  async apiCall(endpoint, options = {}) {
    // TODO: 실제 API 호출 로직
    throw new Error('API not implemented yet');
  }
}

export const settingsService = new SettingsService();