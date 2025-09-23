// MyPage 관련 Mock 데이터
export const mypageData = {
  // 프로필 정보
  userProfile: {
    nickname: "김학습",
    email: "learner@talk100.com",
    profileImage: null,
    avatar: "🦊",
    level: 12,
    levelTitle: "영리한 학습자",
    gradeName: "중급 학습자",
    joinDate: "2024-01-15",
    lastLoginDate: "2024-12-08",
    // 앱 설정을 프로필에 포함
    appSettings: [
      {
        id: 'notifications',
        title: '학습 알림',
        description: '매일 오후 8시',
        icon: '🔔',
        bgColor: 'bg-accent-mint',
        type: 'toggle',
        value: true
      },
      {
        id: 'autoplay',
        title: '음성 자동 재생',
        description: null,
        icon: '🔊',
        bgColor: 'bg-accent-mint',
        type: 'toggle',
        value: false
      },
      {
        id: 'feedback',
        title: '피드백 보내기',
        description: null,
        icon: '💬',
        bgColor: 'bg-accent-mint',
        type: 'link',
        path: '/feedback'
      },
      {
        id: 'help',
        title: '도움말',
        description: null,
        icon: '❓',
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
    accuracy: 87
  },

  // 학습 목표
  learningGoals: {
    dailyGoal: 2,      // 일일 목표 Day 수
    monthlyGoal: 30,   // 월간 목표 학습일
    targetAccuracy: 80  // 목표 정답률 (%)
  },

  // 학습 관리 메뉴 아이템들
  learningManagement: [
    {
      id: 'wrong-answers',
      title: '틀린 문제',
      description: '복습이 필요한 문제들',
      icon: '❌',
      bgColor: 'bg-red-100',
      count: 15,
      path: '/quiz/wrong-answers'
    },
    {
      id: 'favorites',
      title: '즐겨찾기',
      description: '중요 표시한 문제들',
      icon: '❤️',
      bgColor: 'bg-yellow-100',
      count: 28,
      path: '/quiz/favorites'
    },
    {
      id: 'review-schedule',
      title: '복습 스케줄',
      description: '예정된 복습 일정',
      icon: '📅',
      bgColor: 'bg-blue-100',
      count: 3,
      countLabel: '오늘 3개',
      path: '/review'
    },
    {
      id: 'achievements',
      title: '성취 & 뱃지',
      description: '획득한 뱃지 확인',
      icon: '🏆',
      bgColor: 'bg-purple-100',
      count: 12,
      path: '/achievements'
    }
  ],

  // 앱 설정 (MyPage에서 표시되는 간단한 토글들)
  appSettings: [
    {
      id: 'notifications',
      title: '학습 알림',
      description: '매일 오후 8시',
      icon: '🔔',
      bgColor: 'bg-accent-mint',
      type: 'toggle',
      value: true
    },
    {
      id: 'autoplay',
      title: '음성 자동 재생',
      description: null,
      icon: '🔊',
      bgColor: 'bg-accent-mint',
      type: 'toggle',
      value: false
    },
    {
      id: 'feedback',
      title: '피드백 보내기',
      description: null,
      icon: '💬',
      bgColor: 'bg-accent-mint',
      type: 'link',
      path: '/feedback'
    },
    {
      id: 'help',
      title: '도움말',
      description: null,
      icon: '❓',
      bgColor: 'bg-accent-mint',
      type: 'link',
      path: '/help'
    }
  ],

  // 아바타 시스템 데이터
  avatarSystem: {
    current: '🦊',
    userLevel: 12,
    avatars: [
      { emoji: '🐣', name: '병아리', level: 1, desc: '초보 학습자' },
      { emoji: '🐰', name: '토끼', level: 3, desc: '열심히 뛰는 중' },
      { emoji: '🐶', name: '강아지', level: 5, desc: '충실한 학습자' },
      { emoji: '🐱', name: '고양이', level: 7, desc: '똑똑한 학습자' },
      { emoji: '🦊', name: '여우', level: 10, desc: '영리한 학습자' },
      { emoji: '🦁', name: '사자', level: 15, desc: '자신감 넘치는' },
      { emoji: '🦄', name: '유니콘', level: 20, desc: '특별한 학습자' },
      { emoji: '🐲', name: '용', level: 25, desc: '전설의 학습자' },
      { emoji: '🦅', name: '독수리', level: 30, desc: '높이 나는 중' },
      { emoji: '👑', name: '왕관', level: 40, desc: '마스터' }
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