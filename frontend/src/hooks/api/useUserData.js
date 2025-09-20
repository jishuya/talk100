import { useQuery } from '@tanstack/react-query';
import { userService } from '../../services/userService';
import { ENV } from '../../config/environment';

// 사용자 프로필 데이터 훅
export const useUserData = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => userService.getProfile(),
    staleTime: ENV.CACHE_TIMES.USER_DATA,
    retry: 2,
    retryDelay: 1000,
  });

  return {
    user: data,
    isLoading,
    error,
    refetch
  };
};

// 사용자 뱃지 데이터 훅
export const useBadgesData = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', 'badges'],
    queryFn: () => userService.getBadges(),
    staleTime: ENV.CACHE_TIMES.USER_DATA,
    retry: 2,
  });

  return {
    badges: data,
    isLoading,
    error
  };
};