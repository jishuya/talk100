// MyPage 관련 Mock 데이터
export const mypageData = {
  // 프로필 정보
  userProfile: {
    nickname: "김학습",
    email: "learner@talk100.com",
    avatar: "🦊",
    level: 12,
    gradeName: "중급 학습자",
    // 앱 설정을 프로필에 포함
    appSettings: [
      {
        id: 'notifications',
        title: '학습 알림',
        description: '매일 오후 8시',
        icon: 'IoNotifications',
        bgColor: 'bg-accent-mint',
        type: 'toggle',
        value: true
      },
      {
        id: 'autoplay',
        title: '음성 자동 재생',
        description: null,
        icon: 'IoVolumeHigh',
        bgColor: 'bg-accent-mint',
        type: 'toggle',
        value: false
      },
      {
        id: 'voiceSpeed',
        title: '음성 재생 속도',
        description: null,
        icon: 'IoSpeedometer',
        bgColor: 'bg-accent-mint',
        type: 'slider',
        value: 1.0,
        min: 0.5,
        max: 2,
        step: 0.25,
        displayValue: '1.0x',
        sliderLabels: ['0.5x', '1.0x', '1.5x', '2.0x']
      },
      {
        id: 'feedback',
        title: '피드백 보내기',
        description: null,
        icon: 'noto:memo',
        bgColor: 'bg-accent-mint',
        type: 'link',
        path: '/feedback'
      },
      {
        id: 'help',
        title: '도움말',
        description: null,
        icon: 'noto:speech-balloon',
        bgColor: 'bg-accent-mint',
        type: 'link',
        path: '/help'
      }
    ]
  },

  // 학습 요약 (카드)
  summaryStats: {
    totalDays: 45,
    streakDays: 7,
    maxStreakDays: 15
  },

  // 학습 목표
  learningGoals: {
    dailyGoal: 2,           // 오늘의 퀴즈 일일 학습목표
    weeklyAttendance: 3,    // 주간 출석일
    weeklyTotalQuiz: 30     // 주간 푼 문제수
  },

  // 학습 관리 메뉴 아이템들
  learningManagement: [
    {
      id: 'wrong-answers',
      title: '틀린 문제',
      description: '복습이 필요한 문제들',
      icon: 'noto:star',
      bgColor: 'bg-red-100',
      count: 15,
      path: '/quiz/wrong-answers'
    },
    {
      id: 'favorites',
      title: '즐겨찾기',
      description: '중요 표시한 문제들',
      icon: 'noto:red-heart',
      bgColor: 'bg-yellow-100',
      count: 28,
      path: '/quiz/favorites'
    },
    // {
    //   id: 'review-schedule',
    //   title: '복습 스케줄',
    //   description: '예정된 복습 일정',
    //   icon: 'IoTimeOutline',
    //   bgColor: 'bg-blue-100',
    //   count: 3,
    //   countLabel: '오늘 3개',
    //   path: '/review'
    // },
    {
      id: 'achievements',
      title: '성취 & 뱃지',
      description: '획득한 뱃지 확인',
      icon: 'IoTrophy',
      bgColor: 'bg-purple-100',
      count: 12,
      path: '/achievements'
    }
  ],


  // 아바타 시스템 데이터 (백엔드 형식에 맞춤)
  avatarSystem: {
    current: '🦊',
    userLevel: 5,
    totalQuestions: 400,  // 현재 푼 문제 수
    avatars: [
      { emoji: '🐣', name: '병아리', level: 1, requiredQuestions: 0, locked: false },
      { emoji: '🐰', name: '토끼', level: 2, requiredQuestions: 50, locked: false },
      { emoji: '🐶', name: '강아지', level: 3, requiredQuestions: 150, locked: false },
      { emoji: '🐱', name: '고양이', level: 4, requiredQuestions: 250, locked: false },
      { emoji: '🦊', name: '여우', level: 5, requiredQuestions: 350, locked: false },
      { emoji: '🐼', name: '판다', level: 6, requiredQuestions: 450, locked: true },
      { emoji: '🦁', name: '사자', level: 7, requiredQuestions: 550, locked: true },
      { emoji: '🐯', name: '호랑이', level: 8, requiredQuestions: 650, locked: true },
      { emoji: '🦄', name: '유니콘', level: 9, requiredQuestions: 750, locked: true },
      { emoji: '🐲', name: '용', level: 10, requiredQuestions: 850, locked: true },
      { emoji: '��', name: '독수리', level: 11, requiredQuestions: 950, locked: true },
      { emoji: '👑', name: '왕관', level: 12, requiredQuestions: 1050, locked: true }
    ]
  }
};

// API 응답 시뮬레이션을 위한 헬퍼 함수들
export const getMyPageProfile = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mypageData.userProfile);
    }, 300);
  });
};

export const getMypageSummary = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mypageData.summaryStats);
    }, 200);
  });
};

export const getLearningGoals = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mypageData.learningGoals);
    }, 200);
  });
};

export const updateLearningGoals = (newGoals) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock 데이터 업데이트
      Object.assign(mypageData.learningGoals, newGoals);
      resolve(mypageData.learningGoals);
    }, 400);
  });
};

export const updateAvatar = (avatar) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mypageData.userProfile.avatar = avatar;
      mypageData.avatarSystem.current = avatar;
      resolve({ success: true, avatar });
    }, 300);
  });
};

export const getAvatarSystem = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mypageData.avatarSystem);
    }, 200);
  });
};