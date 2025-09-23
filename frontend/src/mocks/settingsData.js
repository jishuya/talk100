// SettingsPage 관련 Mock 데이터
export const settingsData = {
  // 사용자 계정 정보
  accountInfo: {
    nickname: "김학습",
    email: "learner@talk100.com",
    profileImage: null,
    connectedAccounts: [
      { provider: 'google', email: 'learner@gmail.com', connected: true },
      { provider: 'naver', email: '', connected: false }
    ]
  },

  // 학습 설정
  learningSettings: {
    difficulty: 2, // 1: 초급, 2: 중급, 3: 고급
    voiceSpeed: 1.0, // 음성 재생 속도 (0.5 ~ 2.0)
    reviewCount: 6, // 복습 문제 개수 (3 ~ 10)
    autoPlay: false // 자동 음성 재생
  },

  // 알림 설정
  notificationSettings: {
    learningReminder: true, // 학습 리마인더
    reminderTime: { hour: 20, minute: 0 }, // 알림 시간
    reviewReminder: true, // 복습 알림
    weeklyReport: false // 주간 리포트
  },

  // 화면 설정
  displaySettings: {
    theme: 'light', // 'light', 'dark', 'auto'
    fontSize: 'medium' // 'small', 'medium', 'large'
  },

  // 데이터 관리
  dataInfo: {
    cacheSize: 125, // MB
    lastBackup: '2024-12-01',
    totalData: 2.3 // GB
  },

  // 설정 옵션 정의
  settingOptions: {
    difficulty: [
      { value: 1, label: '초급', description: '채점 기준: 50%' },
      { value: 2, label: '중급', description: '채점 기준: 70%' },
      { value: 3, label: '고급', description: '채점 기준: 90%' }
    ],
    theme: [
      { value: 'light', label: '라이트' },
      { value: 'dark', label: '다크' },
      { value: 'auto', label: '자동' }
    ],
    fontSize: [
      { value: 'small', label: '작게' },
      { value: 'medium', label: '보통' },
      { value: 'large', label: '크게' }
    ]
  }
};

// 설정값 포맷팅 헬퍼들
export const formatVoiceSpeed = (speed) => `${speed}x`;
export const formatReviewCount = (count) => `${count}개`;
export const formatCacheSize = (size) => `${size} MB`;

export const formatReminderTime = (hour, minute) => {
  const period = hour >= 12 ? '오후' : '오전';
  const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
  const displayMinute = minute.toString().padStart(2, '0');
  return `${period} ${displayHour}:${displayMinute}`;
};

// API 시뮬레이션 함수들
export const getSettings = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        account: settingsData.accountInfo,
        learning: settingsData.learningSettings,
        notifications: settingsData.notificationSettings,
        display: settingsData.displaySettings,
        data: settingsData.dataInfo
      });
    }, 300);
  });
};

export const updateSettings = (category, newSettings) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        switch (category) {
          case 'learning':
            Object.assign(settingsData.learningSettings, newSettings);
            break;
          case 'notifications':
            Object.assign(settingsData.notificationSettings, newSettings);
            break;
          case 'display':
            Object.assign(settingsData.displaySettings, newSettings);
            break;
          case 'account':
            Object.assign(settingsData.accountInfo, newSettings);
            break;
          default:
            throw new Error('Invalid settings category');
        }
        resolve({ success: true, settings: settingsData[category + 'Settings'] || settingsData.accountInfo });
      } catch (error) {
        reject(error);
      }
    }, 400);
  });
};

export const backupData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      settingsData.dataInfo.lastBackup = new Date().toISOString().split('T')[0];
      resolve({ success: true, message: '학습 기록이 백업되었습니다.' });
    }, 2000);
  });
};

export const exportData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock CSV 데이터 생성
      const csvData = "Date,Category,Question,Answer,Score\n2024-12-08,Model Example,What's your name?,My name is John,85\n";
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);

      resolve({
        success: true,
        downloadUrl: url,
        filename: `talk100_export_${new Date().toISOString().split('T')[0]}.csv`
      });
    }, 1000);
  });
};

export const clearCache = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      settingsData.dataInfo.cacheSize = 0;
      resolve({ success: true, message: '캐시가 삭제되었습니다.' });
    }, 1500);
  });
};

export const resetProgress = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: '학습 기록이 초기화되었습니다.' });
    }, 2000);
  });
};

export const deleteAccount = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: '계정 삭제 요청이 접수되었습니다.' });
    }, 2000);
  });
};