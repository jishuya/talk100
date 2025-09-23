// Mock 데이터 - 개발 및 테스트용
import { statisticsData } from './statisticsData';

export { statisticsData };
export const MOCK_HOME_DATA = {
  user: {
    name: '삔이',
    goal: 20,
    level: 5,
    joinDate: '2024-01-15',
    uid: 'mock_user_123'
  },

  progress: {
    current: 7,
    total: 20,
    percentage: 35,
    streak: 3,              // 연속 학습일
    todayComplete: false,   // 오늘 목표 달성 여부
    lastStudied: '2024-01-20'
  },

  badges: {
    trophy: 182,
    star: 4203,
    newBadges: ['7일 연속 학습'],  // 새로 획득한 뱃지
    totalEarned: 15
  },

  categories: [
    {
      id: 'model-example',
      icon: 'BiBulb',
      title: 'Model Example',
      count: 'Day 1-30',
      path: '/quiz/model-example',
      progress: 23,           // 진행률 (DB에서 계산됨)
      lastStudied: '2024-01-20',
      totalDays: 30
    },
    {
      id: 'small-talk',
      icon: 'BiChat',
      title: 'Small Talk',
      count: 'Day 1-30',
      path: '/quiz/small-talk',
      progress: 15,
      lastStudied: '2024-01-18',
      totalDays: 30
    },
    {
      id: 'cases-in-point',
      icon: 'BiDetail',
      title: 'Cases in Point',
      count: 'Day 1-30',
      path: '/quiz/cases-in-point',
      progress: 8,
      lastStudied: '2024-01-15',
      totalDays: 30
    }
  ],

  personalQuizzes: [
    {
      id: 'wrong-answers',
      icon: 'MdOutlineStar',
      title: '틀린문제',
      count: 15,              // 실제 개수 (Number)
      path: '/quiz/wrong-answers',
      lastUpdated: '2024-01-20'
    },
    {
      id: 'favorites',
      icon: 'AiFillHeart',
      title: '즐겨찾기',
      count: 8,
      path: '/quiz/favorites',
      lastUpdated: '2024-01-19'
    }
  ],

  history: [
    {
      id: 1,
      icon: 'BiBulb',
      title: 'Model Example Day 1',
      time: '10분 전',
      score: 85,
      category: 'model-example',
      day: 1,
      timestamp: '2024-01-20T14:30:00Z'
    },
    {
      id: 2,
      icon: 'BiChat',
      title: 'Small Talk Day 3',
      time: '2시간 전',
      score: 92,
      category: 'small-talk',
      day: 3,
      timestamp: '2024-01-20T12:30:00Z'
    },
    {
      id: 3,
      icon: 'BiDetail',
      title: 'Cases in Point Day 2',
      time: '어제',
      score: 78,
      category: 'cases-in-point',
      day: 2,
      timestamp: '2024-01-19T16:45:00Z'
    }
  ]
};