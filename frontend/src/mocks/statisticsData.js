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
      completedQuestions: 170,  // 실제 푼 문제 수
      totalQuestions: 200,      // 전체 문제 수
      progress: 85              // 170/200 * 100 = 85%
    },
    {
      id: 2,
      name: 'Small Talk',
      completedQuestions: 120,
      totalQuestions: 200,
      progress: 60              // 120/200 * 100 = 60%
    },
    {
      id: 3,
      name: 'Cases in Point',
      completedQuestions: 90,
      totalQuestions: 200,
      progress: 45              // 90/200 * 100 = 45%
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

  // 성취 뱃지 (12개) - icon은 badgeIcons.js에서 매핑
  badges: [
    // 카테고리 완료 (3개)
    {
      id: 'complete-model',
      name: 'Model Example 마스터',
      earned: false,
      description: 'Model Example 카테고리 완료',
      category: 'category'
    },
    {
      id: 'complete-smalltalk',
      name: 'Small Talk 마스터',
      earned: false,
      description: 'Small Talk 카테고리 완료',
      category: 'category'
    },
    {
      id: 'complete-cases',
      name: 'Cases in Point 마스터',
      earned: false,
      description: 'Cases in Point 카테고리 완료',
      category: 'category'
    },

    // 연속 학습 (3개)
    {
      id: 'streak-7',
      name: '일주일 연속',
      earned: true,
      description: '7일 연속 학습 완료',
      category: 'streak'
    },
    {
      id: 'streak-30',
      name: '한달 연속',
      earned: false,
      description: '30일 연속 학습 완료',
      category: 'streak'
    },
    {
      id: 'streak-100',
      name: '백일 연속',
      earned: false,
      description: '100일 연속 학습 완료',
      category: 'streak'
    },

    // 문제 수 (3개)
    {
      id: 'questions-100',
      name: '백문백답',
      earned: true,
      description: '총 100문제 완료',
      category: 'questions'
    },
    {
      id: 'questions-500',
      name: '오백 정복',
      earned: false,
      description: '총 500문제 완료',
      category: 'questions'
    },
    {
      id: 'questions-1000',
      name: '천문대가',
      earned: false,
      description: '총 1000문제 완료',
      category: 'questions'
    },

    // 특수 업적 (3개)
    {
      id: 'master-all',
      name: '완전 정복',
      earned: false,
      description: '모든 카테고리 완료',
      category: 'special'
    },
    {
      id: 'dedicated',
      name: '성실왕',
      earned: false,
      description: '총 100일 학습 완료',
      category: 'special'
    },
    {
      id: 'collector',
      name: '컬렉터',
      earned: false,
      description: '즐겨찾기 50개 등록',
      category: 'special'
    }
  ]
};