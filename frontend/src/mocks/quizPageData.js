// QuizPage 관련 Mock 데이터
export const MOCK_QUIZ_DATA = {
  // 현재 퀴즈 세션 정보
  session: {
    id: 'mock_session_001',
    type: 'daily', // 'daily' | 'category' | 'wrong' | 'favorites'
    title: '오늘의 퀴즈',
    category: 'Small Talk',
    day: 14,
    totalQuestions: 20,
    currentQuestion: 7,
    timeStarted: '2024-01-15T09:30:00Z',
    settings: {
      inputMode: 'voice', // 'voice' | 'keyboard'
      autoNext: true,
      showHints: true,
      playAudio: true
    }
  },

  // 현재 문제 데이터
  currentQuestion: {
    id: 'q_st_14_003',
    category: 'Small Talk',
    day: 14,
    difficulty: 2,
    context: '면접이 잘 진행되지 않는 상황에서',
    korean: '이 인터뷰를 계속하는 게 별 의미가 없을 것 같네요.',
    english: 'I see no point in continuing this interview.',
    keywords: ['point', 'continuing', 'interview'],
    keywordPositions: [
      { word: 'point', start: 9, end: 14 },
      { word: 'continuing', start: 18, end: 28 },
      { word: 'interview', start: 34, end: 43 }
    ],
    hints: [
      '의미 = point',
      '계속하다 = continue',
      '인터뷰 = interview'
    ],
    audioUrl: '/audio/small_talk/day14/003.mp3',
    previousAnswers: [], // 이전 시도 기록
    maxAttempts: 3
  },


  // 퀴즈 진행 상태
  progress: {
    completed: 6,
    total: 20,
    percentage: 30,
    correctAnswers: 5,
    incorrectAnswers: 1,
    skippedQuestions: 0,
    averageScore: 85,
    timeElapsed: 420, // seconds
    estimatedTimeRemaining: 980
  },




  // 에러 상태
  errors: {
    loading: false,
    network: null,
    submission: null
  }
};