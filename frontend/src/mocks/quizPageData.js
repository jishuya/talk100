// QuizPage 관련 Mock 데이터
export const MOCK_QUIZ_DATA = {
  // 현재 퀴즈 세션 정보
  session: {
    id: 'quiz_session_001',
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

  // 사용자 답변 상태
  userAnswer: {
    text: '',
    mode: 'voice', // 'voice' | 'keyboard'
    isRecording: false,
    attempts: 0,
    submittedAt: null,
    score: null,
    matchedKeywords: [],
    feedback: null
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

  // 다음 문제들 (미리 로드)
  nextQuestions: [
    {
      id: 'q_st_14_004',
      category: 'Small Talk',
      day: 14,
      korean: '그 일을 하느라 정말 고생 많으셨어요.',
      english: 'You must have had a hard time doing that.',
      keywords: ['must', 'hard time', 'doing']
    },
    {
      id: 'q_st_14_005',
      category: 'Small Talk',
      day: 14,
      korean: '이런 기회가 또 언제 올지 모르잖아요.',
      english: 'You never know when this kind of opportunity will come again.',
      keywords: ['never know', 'opportunity', 'come again']
    }
  ],

  // 퀴즈 완료 결과 (세션 종료시)
  sessionResult: {
    totalQuestions: 20,
    completedQuestions: 20,
    correctAnswers: 17,
    incorrectAnswers: 2,
    skippedQuestions: 1,
    totalScore: 1450,
    averageScore: 85,
    timeSpent: 1200, // seconds
    accuracy: 85, // percentage
    strengths: ['문법 구조', '어휘 선택'],
    weaknesses: ['발음', '억양'],
    recommendedActions: [
      'Model Example Day 12 복습 추천',
      '틀린 문제 3개가 즐겨찾기에 추가되었습니다'
    ],
    badges: [
      { id: 'consistency_3', name: '3일 연속 학습', icon: '🔥' },
      { id: 'accuracy_80', name: '정확도 80% 달성', icon: '🎯' }
    ]
  },

  // 설정 변경 옵션
  settings: {
    inputModes: [
      { value: 'voice', label: '음성 입력', icon: '🎤' },
      { value: 'keyboard', label: '키보드 입력', icon: '⌨️' },
      { value: 'both', label: '음성+키보드', icon: '🔄' }
    ],
    difficulties: [
      { value: 1, label: '초급 (50%)', passingScore: 50 },
      { value: 2, label: '중급 (70%)', passingScore: 70 },
      { value: 3, label: '고급 (90%)', passingScore: 90 }
    ],
    autoNextOptions: [
      { value: true, label: '자동으로 다음 문제' },
      { value: false, label: '수동으로 다음 문제' }
    ]
  },

  // 에러 상태
  errors: {
    loading: false,
    audioPlayback: null,
    speechRecognition: null,
    network: null,
    submission: null
  },

  // 피드백 메시지 템플릿
  feedbackTemplates: {
    excellent: {
      icon: '🎉',
      title: '완벽해요!',
      messages: [
        '모든 키워드를 정확히 맞추셨어요!',
        '문법과 어순이 완벽합니다!',
        '원어민 수준의 답변이에요!'
      ]
    },
    good: {
      icon: '😊',
      title: '잘했어요!',
      messages: [
        '{count}개 키워드를 맞추셨어요',
        '조금만 더 연습하면 완벽할 거예요',
        '문법 구조는 정확해요!'
      ]
    },
    needsImprovement: {
      icon: '💪',
      title: '다시 도전해보세요!',
      messages: [
        '핵심 키워드를 놓치신 것 같아요',
        '힌트를 참고해서 다시 시도해보세요',
        '포기하지 마세요, 연습이 답입니다!'
      ]
    }
  }
};

// 다양한 퀴즈 타입별 Mock 데이터
export const MOCK_QUIZ_TYPES = {
  daily: {
    title: '오늘의 퀴즈',
    description: '설정된 일일 학습량만큼 문제를 풀어보세요',
    icon: '📅',
    color: 'primary',
    totalQuestions: 20,
    categories: ['Model Example', 'Small Talk', 'Cases in Point']
  },

  category: {
    'model-example': {
      title: 'Model Example',
      description: '완벽한 문장 구조를 학습하세요',
      icon: '💡',
      color: 'amber',
      totalQuestions: 30,
      days: Array.from({length: 100}, (_, i) => i + 1)
    },
    'small-talk': {
      title: 'Small Talk',
      description: '일상 대화에 필요한 표현들',
      icon: '💬',
      color: 'sky',
      totalQuestions: 25,
      days: Array.from({length: 100}, (_, i) => i + 1)
    },
    'cases-in-point': {
      title: 'Cases in Point',
      description: '실전 비즈니스 영어 표현',
      icon: '📋',
      color: 'violet',
      totalQuestions: 20,
      days: Array.from({length: 100}, (_, i) => i + 1)
    }
  },

  wrong: {
    title: '틀린 문제',
    description: '다시 도전해서 완전히 마스터하세요',
    icon: '⭐',
    color: 'orange',
    totalQuestions: 15, // 동적으로 변경됨
    filters: ['all', 'recent', 'starred']
  },

  favorites: {
    title: '즐겨찾기',
    description: '내가 선택한 중요한 문제들',
    icon: '❤️',
    color: 'rose',
    totalQuestions: 8, // 동적으로 변경됨
    sortOptions: ['recent', 'difficulty', 'category']
  }
};

// 채점 관련 Mock 데이터
export const MOCK_GRADING_DATA = {
  // 채점 기준
  gradingCriteria: {
    1: { passingScore: 50, name: '초급' },
    2: { passingScore: 70, name: '중급' },
    3: { passingScore: 90, name: '고급' }
  },

  // 샘플 채점 결과
  sampleGrading: {
    userAnswer: 'I see no point in continuing this interview',
    correctAnswer: 'I see no point in continuing this interview',
    keywords: ['point', 'continuing', 'interview'],
    matchedKeywords: ['point', 'continuing', 'interview'],
    score: 100,
    feedback: {
      type: 'excellent',
      message: '모든 키워드를 정확히 맞추셨어요!',
      suggestions: []
    },
    passed: true,
    attempts: 1
  },

  // 다양한 채점 시나리오
  gradingScenarios: [
    {
      name: '완벽한 답변',
      userAnswer: 'I see no point in continuing this interview',
      score: 100,
      matchedKeywords: ['point', 'continuing', 'interview'],
      feedback: 'excellent'
    },
    {
      name: '일부 키워드 누락',
      userAnswer: 'I see no point in this interview',
      score: 67,
      matchedKeywords: ['point', 'interview'],
      feedback: 'good'
    },
    {
      name: '대부분 키워드 누락',
      userAnswer: 'I think this interview is not good',
      score: 33,
      matchedKeywords: ['interview'],
      feedback: 'needsImprovement'
    }
  ]
};