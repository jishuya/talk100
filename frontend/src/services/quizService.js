import { BaseService } from './baseService';
import { MOCK_QUIZ_DATA, MOCK_QUIZ_TYPES, MOCK_GRADING_DATA } from '../mocks/quizPageData';
import { MOCK_HOME_DATA } from '../mocks/homePageData';

class QuizService extends BaseService {
  constructor() {
    // QuizPage 관련 Mock 데이터와 기존 홈페이지 데이터 결합
    const combinedMockData = {
      ...MOCK_HOME_DATA,
      ...MOCK_QUIZ_DATA,
      quizTypes: MOCK_QUIZ_TYPES,
      grading: MOCK_GRADING_DATA
    };
    super(combinedMockData);
  }

  // ================================================================
  // 퀴즈 세션 관리
  // ================================================================

  // 퀴즈 세션 시작
  async startQuizSession(type, options = {}) {
    return this.request(
      () => this.apiCall('/api/quiz/session/start', {
        method: 'POST',
        data: { type, ...options }
      }),
      'session'
    );
  }

  // 현재 퀴즈 세션 정보 조회
  async getCurrentSession(sessionId) {
    return this.request(
      () => this.apiCall(`/api/quiz/session/${sessionId}`),
      'session'
    );
  }

  // 퀴즈 세션 종료
  async endQuizSession(sessionId, results) {
    return this.request(
      () => this.apiCall(`/api/quiz/session/${sessionId}/end`, {
        method: 'POST',
        data: results
      }),
      'sessionResult'
    );
  }

  // ================================================================
  // 문제 관리
  // ================================================================

  // 현재 문제 조회
  async getCurrentQuestion(sessionId) {
    return this.request(
      () => this.apiCall(`/api/quiz/session/${sessionId}/question`),
      'currentQuestion'
    );
  }

  // 특정 Day의 문제들 조회 (카테고리별 퀴즈용)
  async getDayQuestions(category, day) {
    return this.request(
      () => this.apiCall(`/api/questions/${category}/${day}`),
      'nextQuestions'
    );
  }

  // 틀린 문제 목록 조회
  async getWrongAnswerQuestions(userId, options = {}) {
    return this.request(
      () => this.apiCall(`/api/wrong-answers/${userId}`, {
        params: options
      }),
      'nextQuestions'
    );
  }

  // 즐겨찾기 문제 목록 조회
  async getFavoriteQuestions(userId, options = {}) {
    return this.request(
      () => this.apiCall(`/api/favorites/${userId}`, {
        params: options
      }),
      'nextQuestions'
    );
  }

  // 다음 문제로 이동
  async moveToNextQuestion(sessionId) {
    return this.request(
      () => this.apiCall(`/api/quiz/session/${sessionId}/next`, {
        method: 'POST'
      }),
      'currentQuestion'
    );
  }

  // 문제 건너뛰기
  async skipQuestion(sessionId, questionId) {
    return this.request(
      () => this.apiCall(`/api/quiz/session/${sessionId}/skip`, {
        method: 'POST',
        data: { questionId }
      }),
      'currentQuestion'
    );
  }

  // ================================================================
  // 답변 제출 및 채점
  // ================================================================

  // 답변 제출 및 채점
  async submitAnswer(sessionId, questionId, answer, mode = 'voice') {
    // Mock 채점 로직
    const mockGrading = this.performMockGrading(answer);

    return this.request(
      () => this.apiCall(`/api/quiz/session/${sessionId}/submit`, {
        method: 'POST',
        data: {
          questionId,
          answer,
          mode,
          submittedAt: new Date().toISOString()
        }
      }),
      'grading',
      500,  // 채점 처리 시간 시뮬레이션
      mockGrading
    );
  }

  // Mock 채점 로직 (개발용)
  performMockGrading(userAnswer) {
    const currentQuestion = this.mockData.currentQuestion;
    const keywords = currentQuestion.keywords;

    // 단순 키워드 매칭 (실제로는 더 정교한 로직 필요)
    const matchedKeywords = keywords.filter(keyword =>
      userAnswer.toLowerCase().includes(keyword.toLowerCase())
    );

    const score = Math.round((matchedKeywords.length / keywords.length) * 100);
    const passed = score >= 70; // 중급 기준

    let feedbackType = 'needsImprovement';
    if (score >= 90) feedbackType = 'excellent';
    else if (score >= 70) feedbackType = 'good';

    return {
      score,
      passed,
      matchedKeywords,
      totalKeywords: keywords.length,
      feedback: {
        type: feedbackType,
        message: this.mockData.feedbackTemplates[feedbackType].messages[0],
        icon: this.mockData.feedbackTemplates[feedbackType].icon
      },
      attempts: 1,
      gradedAt: new Date().toISOString()
    };
  }

  // ================================================================
  // 퀴즈 진행률 및 통계
  // ================================================================

  // 현재 세션 진행률 조회
  async getSessionProgress(sessionId) {
    return this.request(
      () => this.apiCall(`/api/quiz/session/${sessionId}/progress`),
      'progress'
    );
  }

  // 퀴즈 설정 업데이트
  async updateQuizSettings(sessionId, settings) {
    const updatedSession = {
      ...this.mockData.session,
      settings: { ...this.mockData.session.settings, ...settings }
    };

    return this.request(
      () => this.apiCall(`/api/quiz/session/${sessionId}/settings`, {
        method: 'PUT',
        data: settings
      }),
      'session',
      200,
      updatedSession
    );
  }

  // ================================================================
  // 즐겨찾기 & 틀린문제 관리
  // ================================================================

  // 즐겨찾기 토글
  async toggleFavorite(questionId) {
    return this.request(
      () => this.apiCall('/api/favorites/toggle', {
        method: 'POST',
        data: { questionId }
      }),
      null,
      300,
      { success: true, isFavorited: true }
    );
  }

  // 틀린 문제에 별표 토글
  async toggleWrongAnswerStar(questionId) {
    return this.request(
      () => this.apiCall('/api/wrong-answers/toggle-star', {
        method: 'PUT',
        data: { questionId }
      }),
      null,
      300,
      { success: true, isStarred: true }
    );
  }

  // ================================================================
  // 오디오 관련
  // ================================================================

  // 문제 오디오 URL 조회
  async getQuestionAudio(questionId) {
    return this.request(
      () => this.apiCall(`/api/questions/${questionId}/audio`),
      null,
      200,
      { audioUrl: `/audio/mock/${questionId}.mp3` }
    );
  }

  // 음성 인식 결과 처리 (Mock)
  async processSpeechRecognition(audioBlob, sessionId) {
    // 실제로는 음성 인식 API 호출
    const mockTranscription = "I see no point in continuing this interview";

    return this.request(
      () => this.apiCall('/api/speech/recognize', {
        method: 'POST',
        data: { audio: audioBlob, sessionId }
      }),
      null,
      1500, // 음성 인식 처리 시간 시뮬레이션
      {
        transcription: mockTranscription,
        confidence: 0.95,
        recognizedAt: new Date().toISOString()
      }
    );
  }

  // ================================================================
  // 퀴즈 타입별 데이터 조회 (HomePage와 공유)
  // ================================================================

  // 퀴즈 카테고리 목록 조회
  async getCategories() {
    return this.request(
      () => this.apiCall('/api/quiz/categories'),
      'categories'
    );
  }

  // 개인 퀴즈 (틀린문제, 즐겨찾기) 조회
  async getPersonalQuizzes() {
    return this.request(
      () => this.apiCall('/api/quiz/personal'),
      'personalQuizzes'
    );
  }

  // 퀴즈 타입별 설정 조회
  async getQuizTypeInfo(type) {
    return this.request(
      () => this.apiCall(`/api/quiz/types/${type}`),
      'quizTypes',
      200,
      this.mockData.quizTypes[type]
    );
  }

  // ================================================================
  // 유틸리티 메서드
  // ================================================================

  // 실제 API 호출 (향후 구현)
  async apiCall(endpoint, options = {}) {
    // TODO: 실제 API 호출 로직
    console.log(`API Call: ${options.method || 'GET'} ${endpoint}`, options.data || options.params);
    throw new Error('API not implemented yet');
  }

  // 에러 처리 헬퍼 (BaseService 확장)
  handleQuizError(error, context = '') {
    console.error(`Quiz ${context} error:`, error);

    // 퀴즈 특정 에러 처리
    if (error.type === 'AUDIO_PLAYBACK_ERROR') {
      throw new Error('오디오 재생에 실패했습니다. 네트워크를 확인해주세요.');
    }

    if (error.type === 'SPEECH_RECOGNITION_ERROR') {
      throw new Error('음성 인식에 실패했습니다. 다시 시도해주세요.');
    }

    if (error.type === 'SESSION_EXPIRED') {
      throw new Error('퀴즈 세션이 만료되었습니다. 다시 시작해주세요.');
    }

    // 기본 에러 처리는 부모 클래스 사용
    return super.handleError(error, context);
  }
}

export const quizService = new QuizService();