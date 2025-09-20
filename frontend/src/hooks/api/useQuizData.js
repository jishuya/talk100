import { useQuery } from '@tanstack/react-query';
import { quizService } from '../../services/quizService';
import { ENV } from '../../config/environment';

// 퀴즈 카테고리 데이터 훅
export const useQuizCategories = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['quiz', 'categories'],
    queryFn: () => quizService.getCategories(),
    staleTime: ENV.CACHE_TIMES.CATEGORIES, // 1시간 캐시 (거의 변하지 않음)
    retry: 2,
  });

  return {
    categories: data,
    isLoading,
    error
  };
};

// 개인 퀴즈 (틀린문제, 즐겨찾기) 데이터 훅
export const usePersonalQuizzes = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['quiz', 'personal'],
    queryFn: () => quizService.getPersonalQuizzes(),
    staleTime: ENV.CACHE_TIMES.HISTORY, // 2분 캐시 (자주 변할 수 있음)
    retry: 2,
  });

  return {
    personalQuizzes: data,
    isLoading,
    error,
    refetch
  };
};