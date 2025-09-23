import { useQuery } from '@tanstack/react-query';
import { statisticsService } from '../../services/statisticsService';

// 전체 통계 요약 데이터
export const useSummaryStats = (period = 'week') => {
  return useQuery({
    queryKey: ['statistics', 'summary', period],
    queryFn: () => statisticsService.getSummaryStats(period),
    staleTime: 5 * 60 * 1000, // 5분
    retry: 2
  });
};

// 연속 학습 데이터
export const useStreakData = () => {
  return useQuery({
    queryKey: ['statistics', 'streak'],
    queryFn: () => statisticsService.getStreakData(),
    staleTime: 5 * 60 * 1000,
    retry: 2
  });
};

// 주간 출석 패턴 데이터
export const useWeeklyPattern = (period = 'week') => {
  return useQuery({
    queryKey: ['statistics', 'weekly-pattern', period],
    queryFn: () => statisticsService.getWeeklyPattern(period),
    staleTime: 5 * 60 * 1000,
    retry: 2
  });
};

// 카테고리별 진행률 데이터
export const useCategoryProgress = () => {
  return useQuery({
    queryKey: ['statistics', 'category-progress'],
    queryFn: () => statisticsService.getCategoryProgress(),
    staleTime: 5 * 60 * 1000,
    retry: 2
  });
};

// 학습 패턴 분석 데이터
export const useLearningPattern = (period = 'week') => {
  return useQuery({
    queryKey: ['statistics', 'learning-pattern', period],
    queryFn: () => statisticsService.getLearningPattern(period),
    staleTime: 5 * 60 * 1000,
    retry: 2
  });
};

// 성취 뱃지 데이터
export const useBadgesData = () => {
  return useQuery({
    queryKey: ['statistics', 'badges'],
    queryFn: () => statisticsService.getBadges(),
    staleTime: 10 * 60 * 1000, // 10분 (뱃지는 자주 변경되지 않음)
    retry: 2
  });
};

// 전체 통계 데이터 (모든 데이터를 한번에)
export const useAllStatistics = (period = 'week') => {
  const summaryQuery = useSummaryStats(period);
  const streakQuery = useStreakData();
  const weeklyPatternQuery = useWeeklyPattern(period);
  const categoryProgressQuery = useCategoryProgress();
  const learningPatternQuery = useLearningPattern(period);
  const badgesQuery = useBadgesData();

  return {
    summary: summaryQuery.data,
    streak: streakQuery.data,
    weeklyPattern: weeklyPatternQuery.data,
    categoryProgress: categoryProgressQuery.data,
    learningPattern: learningPatternQuery.data,
    badges: badgesQuery.data,
    isLoading: summaryQuery.isLoading || streakQuery.isLoading ||
               weeklyPatternQuery.isLoading || categoryProgressQuery.isLoading ||
               learningPatternQuery.isLoading || badgesQuery.isLoading,
    error: summaryQuery.error || streakQuery.error ||
           weeklyPatternQuery.error || categoryProgressQuery.error ||
           learningPatternQuery.error || badgesQuery.error
  };
};