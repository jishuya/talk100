// QuizPage 관련 Mock 데이터
export const MOCK_QUIZ_DATA = {
  // 현재 퀴즈 세션 정보
  session: {
    id: 'mock_session_001',
    type: 'daily', // 'daily' | 'category' | 'wrong' | 'favorites'
    title: '오늘의 퀴즈',
    category: 2,
    day: 14,
    totalQuestions: 20,
    currentQuestion: 7,
    timeStarted: '2024-01-15T09:30:00Z'
  },

  // 현재 문제 데이터
  currentQuestion: {
    id: 'q_st_14_003',
    category: 2,
    day: 14,
    difficulty: 2,
    context: '면접이 잘 진행되지 않는 상황에서',
    korean: '이 인터뷰를 계속하는 게 별 의미가 없을 것 같네요.',
    english: 'I see no point in continuing this interview.',
    keywords: ['point', 'continuing', 'interview'],
    audioUrl: '/audio/small_talk/day14/003.mp3',
    isFavorite: false, // 즐겨찾기 상태 (true=꽉찬하트, false=빈하트)
    isStarred: true    // 틀린문제/별표 상태 (true=노란별, false=회색별)
  },

  // 퀴즈 진행 상태
  progress: {
    completed: 6,
    total: 20,
    percentage: 30,
    correctAnswers: 5,
    incorrectAnswers: 1,
    skippedQuestions: 0,
    averageScore: 85
  },

  // 에러 상태
  errors: {
    loading: false,
    network: null,
    submission: null
  }
};