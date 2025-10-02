// QuizPage 관련 Mock 데이터
export const MOCK_QUIZ_DATA = {
  // 서버에서 불러올 현재 문제 데이터
  currentQuestion: {
    id: 2,
    category: 2,  // Small Talk
    day: 1,
    context: '면접이 잘 진행되지 않는 상황에서',
    korean: '이 인터뷰를 계속하는 게 별 의미가 없을 것 같네요.',
    english: 'I see no point in continuing this interview.',
    keywords: ['point', 'continuing', 'interview'],
    audioUrl: '/audio/small_talk/day1/002.mp3'
  }
};