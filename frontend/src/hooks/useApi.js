// 통합 API 훅
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/apiService';
import { ENV } from '../config/environment';

// ==============================================
// 사용자 관련 훅
// ==============================================

export const useUserData = () => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => api.getUser(),
    staleTime: ENV.CACHE_TIMES.USER_DATA,
    retry: 2,
    retryDelay: 1000,
  });
};

export const useBadgesData = () => {
  return useQuery({
    queryKey: ['user', 'badges'],
    queryFn: () => api.getBadges(),
    staleTime: ENV.CACHE_TIMES.USER_DATA,
    retry: 2,
  });
};

export const usePersonalQuizzesData = () => {
  return useQuery({
    queryKey: ['user', 'personalQuizzes'],
    queryFn: () => api.getPersonalQuizzes(),
    staleTime: ENV.CACHE_TIMES.USER_DATA,
    retry: 2,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['user', 'profile']);
    },
  });
};

// ==============================================
// 진행률 관련 훅
// ==============================================

export const useProgressData = () => {
  return useQuery({
    queryKey: ['progress'],
    queryFn: () => api.getProgress(),
    staleTime: ENV.CACHE_TIMES.PROGRESS,
    retry: 2,
  });
};

export const useDailyProgress = () => {
  return useQuery({
    queryKey: ['progress', 'daily'],
    queryFn: () => api.getDailyProgress(),
    staleTime: ENV.CACHE_TIMES.PROGRESS,
    retry: 2,
  });
};

export const useUpdateProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.updateProgress(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['progress']);
    },
  });
};

// ==============================================
// 퀴즈 관련 훅
// ==============================================

// Day별 전체 문제 조회
export const useQuizQuestions = (category, day) => {
  return useQuery({
    queryKey: ['quiz', 'questions', category, day],
    queryFn: () => api.getQuestions(category, day),
    staleTime: ENV.CACHE_TIMES.QUIZ_SESSION,
    enabled: !!category && !!day,
    retry: 2,
  });
};

// 특정 문제 조회
export const useQuizQuestion = (questionId) => {
  return useQuery({
    queryKey: ['quiz', 'question', questionId],
    queryFn: () => api.getQuestion(questionId),
    staleTime: ENV.CACHE_TIMES.QUIZ_SESSION,
    enabled: !!questionId,
    retry: 2,
  });
};

// 카테고리별 Day 범위 조회
export const useDayRange = (category) => {
  return useQuery({
    queryKey: ['quiz', 'day-range', category],
    queryFn: () => api.getDayRange(category),
    staleTime: ENV.CACHE_TIMES.CATEGORIES,
    enabled: !!category,
    retry: 2,
  });
};

// 즐겨찾기 문제 조회
export const useFavoriteQuestions = () => {
  return useQuery({
    queryKey: ['quiz', 'favorites'],
    queryFn: () => api.getFavoriteQuestions(),
    staleTime: ENV.CACHE_TIMES.USER_DATA,
    retry: 2,
  });
};

// 틀린 문제 조회
export const useWrongAnswerQuestions = () => {
  return useQuery({
    queryKey: ['quiz', 'wrong-answers'],
    queryFn: () => api.getWrongAnswerQuestions(),
    staleTime: ENV.CACHE_TIMES.USER_DATA,
    retry: 2,
  });
};

// 레거시 - 퀴즈 세션 데이터 조회
export const useQuizData = (sessionId) => {
  return useQuery({
    queryKey: ['quiz', 'session', sessionId],
    queryFn: () => api.getQuizSession(sessionId),
    staleTime: ENV.CACHE_TIMES.QUIZ_SESSION,
    enabled: !!sessionId,
    retry: 2,
  });
};

export const useHistoryData = () => {
  return useQuery({
    queryKey: ['user', 'history'],
    queryFn: () => api.getHistory(),
    staleTime: ENV.CACHE_TIMES.HISTORY,
    retry: 2,
  });
};

export const useSubmitAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.submitAnswer(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['quiz', 'history']);
      queryClient.invalidateQueries(['progress']);
    },
  });
};

// 틀린 문제 토글 (별 아이콘)
export const useToggleWrongAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questionId, isStarred }) => api.toggleWrongAnswer(questionId, isStarred),
    onSuccess: () => {
      // 틀린 문제 리스트 캐시 무효화
      queryClient.invalidateQueries(['quiz', 'wrong-answers']);
      // 개인 퀴즈 카운트 캐시 무효화 (홈 화면)
      queryClient.invalidateQueries(['user', 'personalQuizzes']);
    },
  });
};

// 즐겨찾기 토글 (하트 아이콘)
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questionId, isFavorite }) => api.toggleFavorite(questionId, isFavorite),
    onSuccess: () => {
      // 즐겨찾기 리스트 캐시 무효화
      queryClient.invalidateQueries(['quiz', 'favorites']);
      // 개인 퀴즈 카운트 캐시 무효화 (홈 화면)
      queryClient.invalidateQueries(['user', 'personalQuizzes']);
    },
  });
};

// ==============================================
// 마이페이지 관련 훅
// ==============================================

export const useMypageData = () => {
  return useQuery({
    queryKey: ['mypage'],
    queryFn: () => api.getMypageData(),
    staleTime: ENV.CACHE_TIMES.USER_DATA,
    retry: 2,
  });
};

export const useUpdateGoals = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.updateGoals(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['mypage']);
      queryClient.invalidateQueries(['user', 'profile']);
    },
  });
};

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.updateAvatar(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['mypage']);
      queryClient.invalidateQueries(['user', 'profile']);
    },
  });
};

// ==============================================
// 설정 관련 훅
// ==============================================

export const useSettingsData = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => api.getSettings(),
    staleTime: ENV.CACHE_TIMES.USER_DATA,
    retry: 2,
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['settings']);
    },
  });
};

// ==============================================
// 통계 관련 훅
// ==============================================

export const useStatisticsData = (period = '7days') => {
  return useQuery({
    queryKey: ['statistics', period],
    queryFn: () => api.getStatistics(period),
    staleTime: ENV.CACHE_TIMES.HISTORY,
    retry: 2,
  });
};

export const useWeeklyChart = () => {
  return useQuery({
    queryKey: ['statistics', 'weekly'],
    queryFn: () => api.getWeeklyChart(),
    staleTime: ENV.CACHE_TIMES.HISTORY,
    retry: 2,
  });
};

export const useCategoryProgress = () => {
  return useQuery({
    queryKey: ['statistics', 'categories'],
    queryFn: () => api.getCategoryProgress(),
    staleTime: ENV.CACHE_TIMES.CATEGORIES,
    retry: 2,
  });
};

export const useLearningPattern = () => {
  return useQuery({
    queryKey: ['statistics', 'pattern'],
    queryFn: () => api.getLearningPattern(),
    staleTime: ENV.CACHE_TIMES.HISTORY,
    retry: 2,
  });
};

// ==============================================
// 로그아웃 관련 훅
// ==============================================

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      // 로그아웃 로직 (임시)
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_info');
      return Promise.resolve({ success: true });
    },
    onSuccess: () => {
      // 모든 케시 초기화
      queryClient.clear();
      // 로그인 페이지로 리다이렉트
      window.location.href = '/login';
    },
  });
};