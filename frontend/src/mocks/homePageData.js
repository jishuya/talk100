// Mock 데이터 - 개발 및 테스트용
import { statisticsData } from './statisticsData';

export { statisticsData };
export const MOCK_HOME_DATA = {
  user: {
    name: '삔이',
    goal: 20,
    level: 5
  },

  progress: {
    current: 7,
    total: 20,
    percentage: 35
  },

  badges: {
    trophy: 182,
    star: 4203
  },

  categories: [
    {
      id: 'model-example',
      icon: 'tabler:bulb',
      title: 'Model Example',
      path: '/quiz/model-example'
    },
    {
      id: 'small-talk',
      icon: 'tabler:message-circle',
      title: 'Small Talk',
      path: '/quiz/small-talk'
    },
    {
      id: 'cases-in-point',
      icon: 'tabler:file-text',
      title: 'Cases in Point',
      path: '/quiz/cases-in-point'
    }
  ],

  personalQuizzes: [
    {
      id: 'wrong-answers',
      icon: 'fluent:star-24-filled',
      title: '틀린문제',
      count: 15,
      path: '/quiz/wrong-answers'
    },
    {
      id: 'favorites',
      icon: 'fluent:heart-24-filled',
      title: '즐겨찾기',
      count: 8,
      path: '/quiz/favorites'
    }
  ],

  history: [
    {
      id: 1,
      icon: 'tabler:bulb',
      title: 'Model Example Day 1',
      time: '10분 전',
      score: 85,
      category: 'model-example'
    },
    {
      id: 2,
      icon: 'tabler:message-circle',
      title: 'Small Talk Day 3',
      time: '2시간 전',
      score: 92,
      category: 'small-talk'
    },
    {
      id: 3,
      icon: 'tabler:file-text',
      title: 'Cases in Point Day 2',
      time: '어제',
      score: 78,
      category: 'cases-in-point'
    }
  ]
};