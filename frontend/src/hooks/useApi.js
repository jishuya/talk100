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

// ==============================================
// 진행률 관련 훅
// ==============================================

/**
 * 오늘의 퀴즈 진행률 조회 (CharacterSection & QuizProgressBar 공용)
 * - 실시간 서버 데이터 사용
 * - daily_progress.start_day 기준 계산
 * - React Query 캐싱으로 중복 호출 방지
 */
export const useTodayProgress = () => {
  return useQuery({
    queryKey: ['progress', 'today'],
    queryFn: () => api.getProgress(),
    staleTime: ENV.CACHE_TIMES.PROGRESS,
    refetchOnWindowFocus: true,  // 홈 복귀 시 자동 갱신
    retry: 2,
  });
};

// 하위 호환성을 위한 alias
export const useProgressData = useTodayProgress;

export const useUpdateProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.updateProgress(data),
    onSuccess: () => {
      // 진행률 캐시 무효화 (CharacterSection & QuizProgressBar 자동 갱신)
      queryClient.invalidateQueries(['progress', 'today']);
      queryClient.invalidateQueries(['progress']);  // 하위 호환성
    },
  });
};

// ==============================================
// 퀴즈 관련 훅
// ==============================================

export const useHistoryData = () => {
  return useQuery({
    queryKey: ['user', 'history'],
    queryFn: () => api.getHistory(),
    staleTime: ENV.CACHE_TIMES.HISTORY,
    retry: 2,
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

export const useMypageSummary = () => {
  return useQuery({
    queryKey: ['mypage', 'summary'],
    queryFn: () => api.getMypageSummary(),
    staleTime: ENV.CACHE_TIMES.PROGRESS,
    retry: 2,
  });
};

export const useAvatarSystem = () => {
  return useQuery({
    queryKey: ['avatar', 'system'],
    queryFn: () => api.getAvatarSystem(),
    staleTime: ENV.CACHE_TIMES.USER_DATA,
    retry: 2,
  });
};

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (avatar) => api.updateAvatar(avatar),
    onSuccess: () => {
      queryClient.invalidateQueries(['avatar', 'system']);
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
    staleTime: 0, // Always fetch fresh data
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

export const useWeeklyChart = (period = 'week') => {
  return useQuery({
    queryKey: ['statistics', 'weekly', period],
    queryFn: () => api.getWeeklyChart(period),
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

export const useLearningPattern = (period = 'week') => {
  return useQuery({
    queryKey: ['statistics', 'pattern', period],
    queryFn: () => api.getLearningPattern(period),
    staleTime: ENV.CACHE_TIMES.HISTORY,
    retry: 2,
  });
};

export const useBadgesAchievements = () => {
  return useQuery({
    queryKey: ['badges', 'achievements'],
    queryFn: () => api.getBadgesAchievements(),
    staleTime: ENV.CACHE_TIMES.USER_DATA,  // 5분
    retry: 2,
  });
};

export const useSummaryStats = (period = 'week') => {
  return useQuery({
    queryKey: ['statistics', 'summary', period],
    queryFn: () => api.getSummaryStats(period),
    staleTime: ENV.CACHE_TIMES.PROGRESS,  // 1분
    retry: 2,
  });
};

export const useStreakData = () => {
  return useQuery({
    queryKey: ['statistics', 'streak'],
    queryFn: () => api.getStreakData(),
    staleTime: ENV.CACHE_TIMES.PROGRESS,  // 1분
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