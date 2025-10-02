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
    days: 100,
    questions: 200
  },

  personalQuizzes: [
    {
      category_id: 5,
      count: 100,
    },
    {
      category_id: 6,
      count: 100,
    }
  ],

  history: [
    {
      id: 1,
      last_day: 5,
      last_question_id: 123,
      time: '10분 전',
      percent: 85,  // 해당 day의 문제를 몇 퍼센트 풀었는지 (푼 문제수/총 문제수 *100)
    },
    {
      id: 2,
      last_day: 4,
      last_question_id: 98,
      time: '2시간 전',
      percent: 92,
    },
    {
      id: 3,
      last_day: 3,
      last_question_id: 76,
      time: '어제',
      percent: 78,
    }
  ]
};