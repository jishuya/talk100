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

export const useQuizData = (categoryId) => {
  return useQuery({
    queryKey: ['quiz', 'session', categoryId],
    queryFn: () => api.getQuizSession(categoryId),
    staleTime: ENV.CACHE_TIMES.QUIZ_SESSION,
    enabled: !!categoryId,
    retry: 2,
  });
};

export const useQuizHistory = () => {
  return useQuery({
    queryKey: ['quiz', 'history'],
    queryFn: () => api.getQuizHistory(),
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