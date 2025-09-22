import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizService } from '../../services/quizService';
import { ENV } from '../../config/environment';

// ================================================================
// 퀴즈 세션 관리 훅
// ================================================================

// 퀴즈 세션 시작 훅
export const useStartQuizSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, options }) => quizService.startQuizSession(type, options),
    onSuccess: (sessionData) => {
      // 세션 데이터를 캐시에 저장
      queryClient.setQueryData(['quiz', 'session', sessionData.id], sessionData);
    },
    onError: (error) => {
      console.error('Quiz session start failed:', error);
    }
  });
};

// 현재 퀴즈 세션 정보 훅
export const useQuizSession = (sessionId) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['quiz', 'session', sessionId],
    queryFn: () => quizService.getCurrentSession(sessionId),
    enabled: !!sessionId,
    staleTime: ENV.CACHE_TIMES.QUIZ_SESSION || 30000, // 30초
    retry: 2,
  });

  return {
    session: data,
    isLoading,
    error,
    refetch
  };
};

// 퀴즈 세션 종료 훅
export const useEndQuizSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, results }) => quizService.endQuizSession(sessionId, results),
    onSuccess: (resultData, { sessionId }) => {
      // 세션 캐시 무효화
      queryClient.invalidateQueries(['quiz', 'session', sessionId]);
      // 결과 데이터 캐시에 저장
      queryClient.setQueryData(['quiz', 'result', sessionId], resultData);
    }
  });
};

// ================================================================
// 문제 관리 훅
// ================================================================

// 현재 문제 조회 훅
export const useCurrentQuestion = (sessionId) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['quiz', 'question', sessionId],
    queryFn: () => quizService.getCurrentQuestion(sessionId),
    enabled: !!sessionId,
    staleTime: 0, // 항상 최신 문제 조회
    retry: 2,
  });

  return {
    question: data,
    isLoading,
    error,
    refetch
  };
};

// Day별 문제 조회 훅 (카테고리별 퀴즈용)
export const useDayQuestions = (category, day) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['questions', category, day],
    queryFn: () => quizService.getDayQuestions(category, day),
    enabled: !!(category && day),
    staleTime: ENV.CACHE_TIMES.QUESTIONS || 300000, // 5분
    retry: 2,
  });

  return {
    questions: data,
    isLoading,
    error
  };
};

// 틀린 문제 목록 훅
export const useWrongAnswerQuestions = (userId, options = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['wrong-answers', userId, options],
    queryFn: () => quizService.getWrongAnswerQuestions(userId, options),
    enabled: !!userId,
    staleTime: ENV.CACHE_TIMES.HISTORY || 120000, // 2분
    retry: 2,
  });

  return {
    wrongQuestions: data,
    isLoading,
    error,
    refetch
  };
};

// 즐겨찾기 문제 목록 훅
export const useFavoriteQuestions = (userId, options = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['favorites', userId, options],
    queryFn: () => quizService.getFavoriteQuestions(userId, options),
    enabled: !!userId,
    staleTime: ENV.CACHE_TIMES.HISTORY || 120000, // 2분
    retry: 2,
  });

  return {
    favoriteQuestions: data,
    isLoading,
    error,
    refetch
  };
};

// 다음 문제로 이동 훅
export const useMoveToNextQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId) => quizService.moveToNextQuestion(sessionId),
    onSuccess: (newQuestion, sessionId) => {
      // 현재 문제 캐시 업데이트
      queryClient.setQueryData(['quiz', 'question', sessionId], newQuestion);
      // 세션 진행률 캐시 무효화 (업데이트 필요)
      queryClient.invalidateQueries(['quiz', 'progress', sessionId]);
    }
  });
};

// 문제 건너뛰기 훅
export const useSkipQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, questionId }) => quizService.skipQuestion(sessionId, questionId),
    onSuccess: (newQuestion, { sessionId }) => {
      queryClient.setQueryData(['quiz', 'question', sessionId], newQuestion);
      queryClient.invalidateQueries(['quiz', 'progress', sessionId]);
    }
  });
};

// ================================================================
// 답변 제출 및 채점 훅
// ================================================================

// 답변 제출 및 채점 훅
export const useSubmitAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, questionId, answer, mode }) =>
      quizService.submitAnswer(sessionId, questionId, answer, mode),
    onSuccess: (gradingResult, { sessionId, questionId }) => {
      // 채점 결과 캐시에 저장
      queryClient.setQueryData(['quiz', 'grading', questionId], gradingResult);
      // 세션 진행률 무효화 (점수 업데이트 필요)
      queryClient.invalidateQueries(['quiz', 'progress', sessionId]);

      // 틀린 답변인 경우 틀린 문제 목록 무효화
      if (!gradingResult.passed) {
        queryClient.invalidateQueries(['wrong-answers']);
      }
    },
    onError: (error) => {
      console.error('Answer submission failed:', error);
    }
  });
};

// ================================================================
// 퀴즈 진행률 및 통계 훅
// ================================================================

// 세션 진행률 훅
export const useSessionProgress = (sessionId) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['quiz', 'progress', sessionId],
    queryFn: () => quizService.getSessionProgress(sessionId),
    enabled: !!sessionId,
    staleTime: 10000, // 10초 (자주 업데이트됨)
    refetchInterval: 15000, // 15초마다 자동 갱신
    retry: 2,
  });

  return {
    progress: data,
    isLoading,
    error
  };
};

// 퀴즈 설정 업데이트 훅
export const useUpdateQuizSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, settings }) => quizService.updateQuizSettings(sessionId, settings),
    onSuccess: (updatedSession, { sessionId }) => {
      // 세션 정보 캐시 업데이트
      queryClient.setQueryData(['quiz', 'session', sessionId], updatedSession);
    }
  });
};

// ================================================================
// 즐겨찾기 & 틀린문제 관리 훅
// ================================================================

// 즐겨찾기 토글 훅
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId) => quizService.toggleFavorite(questionId),
    onSuccess: () => {
      // 즐겨찾기 목록 캐시 무효화
      queryClient.invalidateQueries(['favorites']);
      // 개인 퀴즈 목록도 무효화 (카운트 변경됨)
      queryClient.invalidateQueries(['quiz', 'personal']);
    }
  });
};

// 틀린 문제 별표 토글 훅
export const useToggleWrongAnswerStar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId) => quizService.toggleWrongAnswerStar(questionId),
    onSuccess: () => {
      // 틀린 문제 목록 캐시 무효화
      queryClient.invalidateQueries(['wrong-answers']);
    }
  });
};

// ================================================================
// 오디오 관련 훅
// ================================================================

// 문제 오디오 URL 조회 훅
export const useQuestionAudio = (questionId) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['audio', questionId],
    queryFn: () => quizService.getQuestionAudio(questionId),
    enabled: !!questionId,
    staleTime: ENV.CACHE_TIMES.AUDIO || 3600000, // 1시간 (오디오 URL은 거의 변하지 않음)
    retry: 1,
  });

  return {
    audioUrl: data?.audioUrl,
    isLoading,
    error
  };
};

// 음성 인식 처리 훅
export const useSpeechRecognition = () => {
  return useMutation({
    mutationFn: ({ audioBlob, sessionId }) => quizService.processSpeechRecognition(audioBlob, sessionId),
    onError: (error) => {
      console.error('Speech recognition failed:', error);
    }
  });
};

// ================================================================
// 퀴즈 타입 관련 훅 (HomePage와 공유)
// ================================================================

// 퀴즈 카테고리 목록 훅
export const useQuizCategories = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['quiz', 'categories'],
    queryFn: () => quizService.getCategories(),
    staleTime: ENV.CACHE_TIMES.CATEGORIES || 3600000, // 1시간 (거의 변하지 않음)
    retry: 2,
  });

  return {
    categories: data,
    isLoading,
    error
  };
};

// 개인 퀴즈 목록 훅 (틀린문제, 즐겨찾기)
export const usePersonalQuizzes = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['quiz', 'personal'],
    queryFn: () => quizService.getPersonalQuizzes(),
    staleTime: ENV.CACHE_TIMES.HISTORY || 120000, // 2분 (자주 변할 수 있음)
    retry: 2,
  });

  return {
    personalQuizzes: data,
    isLoading,
    error,
    refetch
  };
};

// 퀴즈 타입별 정보 훅
export const useQuizTypeInfo = (type) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['quiz', 'type', type],
    queryFn: () => quizService.getQuizTypeInfo(type),
    enabled: !!type,
    staleTime: ENV.CACHE_TIMES.CATEGORIES || 3600000, // 1시간
    retry: 2,
  });

  return {
    typeInfo: data,
    isLoading,
    error
  };
};

// ================================================================
// 복합 훅 (여러 데이터를 조합)
// ================================================================

// 퀴즈 페이지 전체 데이터 훅
export const useQuizPageData = (sessionId) => {
  const sessionQuery = useQuizSession(sessionId);
  const questionQuery = useCurrentQuestion(sessionId);
  const progressQuery = useSessionProgress(sessionId);

  return {
    session: sessionQuery.session,
    question: questionQuery.question,
    progress: progressQuery.progress,
    isLoading: sessionQuery.isLoading || questionQuery.isLoading || progressQuery.isLoading,
    error: sessionQuery.error || questionQuery.error || progressQuery.error,
    refetch: () => {
      sessionQuery.refetch();
      questionQuery.refetch();
      progressQuery.refetch();
    }
  };
};