import { useQuery } from '@tanstack/react-query';
import { progressService } from '../../services/progressService';
import { ENV } from '../../config/environment';

// 현재 진행률 데이터 훅
export const useProgressData = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['progress', 'current'],
    queryFn: () => progressService.getCurrentProgress(),
    staleTime: ENV.CACHE_TIMES.PROGRESS,
    refetchInterval: ENV.CACHE_TIMES.PROGRESS, // 자동 갱신
    retry: 2,
  });

  return {
    progress: data,
    isLoading,
    error,
    refetch
  };
};

// 학습 기록 데이터 훅
export const useStudyHistory = (limit = 10) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['progress', 'history', limit],
    queryFn: () => progressService.getStudyHistory(limit),
    staleTime: ENV.CACHE_TIMES.HISTORY,
    retry: 2,
  });

  return {
    history: data,
    isLoading,
    error
  };
};