// 통계 Mock 데이터
export const statisticsData = {
  // 전체 통계 요약
  summaryStats: {
    week: {
      totalDays: 7,              // ✅ 학습한 날 수
      studiedQuestions: 42,      // ✅ 학습한 문제 수
      dailyAverage: 6.0,         // ✅ 일평균 학습 문제 수
      reviewCount: 5             // ✅ 복습 표시한 문제 수 (⭐)
    },
    month: {
      totalDays: 30,
      studiedQuestions: 180,
      dailyAverage: 6.0,
      reviewCount: 18
    },
    all: {
      totalDays: 45,
      studiedQuestions: 342,
      dailyAverage: 7.6,
      reviewCount: 28
    }
  },

  // 연속 학습 데이터
  streakData: {
    current: 7,
    best: 15
  },

  // 주간 출석 패턴 (요일별)
  weeklyPattern: {
    week: [
      { day: '일', count: 3, percentage: 60 },
      { day: '월', count: 5, percentage: 100 },
      { day: '화', count: 4, percentage: 80 },
      { day: '수', count: 5, percentage: 100 },
      { day: '목', count: 2, percentage: 40 },
      { day: '금', count: 3, percentage: 60 },
      { day: '토', count: 1, percentage: 20 }
    ],
    month: [
      { day: '일', count: 8, percentage: 65 },
      { day: '월', count: 12, percentage: 100 },
      { day: '화', count: 10, percentage: 83 },
      { day: '수', count: 11, percentage: 92 },
      { day: '목', count: 7, percentage: 58 },
      { day: '금', count: 9, percentage: 75 },
      { day: '토', count: 5, percentage: 42 }
    ],
    all: [
      { day: '일', count: 15, percentage: 70 },
      { day: '월', count: 20, percentage: 100 },
      { day: '화', count: 18, percentage: 90 },
      { day: '수', count: 19, percentage: 95 },
      { day: '목', count: 12, percentage: 60 },
      { day: '금', count: 16, percentage: 80 },
      { day: '토', count: 8, percentage: 40 }
    ]
  },

  // 카테고리별 진행률
  categoryProgress: [
    {
      id: 1,
      name: 'Model Example',
      progress: 85,
      currentDay: 25,
      totalDays: 30
    },
    {
      id: 2,
      name: 'Small Talk',
      progress: 60,
      currentDay: 18,
      totalDays: 30
    },
    {
      id: 3,
      name: 'Cases in Point',
      progress: 45,
      currentDay: 13,
      totalDays: 30
    }
  ],

  // 학습 패턴 분석
  learningPattern: {
    week: {
      dailyAvgQuestions: 6.0,       // ✅ 일평균 학습 문제 수
      totalDaysCompleted: 3,        // ✅ 일일목표(daily goal) 완료 횟수
      reviewQuestions: 5,           // ✅ 복습 필요 문제 (⭐)
      favorites: 12                 // ✅ 즐겨찾기 (❤️)
    },
    month: {
      dailyAvgQuestions: 6.0,
      totalDaysCompleted: 15,
      reviewQuestions: 18,
      favorites: 25
    },
    all: {
      dailyAvgQuestions: 7.6,
      totalDaysCompleted: 25,
      reviewQuestions: 28,
      favorites: 35
    }
  },

  // 성취 뱃지
  badges: [
    {
      id: 'streak-7',
      name: '7일 연속',
      icon: '🔥',
      earned: true,
      description: '7일 연속 학습 완료'
    },
    {
      id: 'problems-100',
      name: '100문제 달성',
      icon: '📚',
      earned: true,
      description: '총 100문제 해결'
    },
    {
      id: 'accuracy-80',
      name: '정답률 80%',
      icon: '⭐',
      earned: true,
      description: '정답률 80% 달성'
    },
    {
      id: 'monthly-goal',
      name: '월간 목표',
      icon: '🎯',
      earned: false,
      description: '월간 학습 목표 달성'
    },
    {
      id: 'master',
      name: '마스터',
      icon: '💎',
      earned: false,
      description: '모든 카테고리 완주'
    },
    {
      id: 'perfect',
      name: '퍼펙트',
      icon: '🥇',
      earned: false,
      description: '정답률 100% 달성'
    }
  ]
};