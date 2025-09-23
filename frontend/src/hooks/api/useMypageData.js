import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mypageService } from '../../services/mypageService';

// 프로필 정보 조회
export const useMypageProfile = () => {
  return useQuery({
    queryKey: ['mypage', 'profile'],
    queryFn: () => mypageService.getProfile(),
    staleTime: 5 * 60 * 1000, // 5분
    retry: 2
  });
};

// 요약 통계 조회
export const useMypageSummary = () => {
  return useQuery({
    queryKey: ['mypage', 'summary'],
    queryFn: () => mypageService.getSummaryStats(),
    staleTime: 2 * 60 * 1000, // 2분
    retry: 2
  });
};

// 학습 목표 조회
export const useLearningGoals = () => {
  return useQuery({
    queryKey: ['mypage', 'goals'],
    queryFn: () => mypageService.getLearningGoals(),
    staleTime: 10 * 60 * 1000, // 10분
    retry: 2
  });
};

// 학습 목표 업데이트
export const useUpdateLearningGoals = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goals) => mypageService.updateLearningGoals(goals),
    onSuccess: (data) => {
      // 캐시 업데이트
      queryClient.setQueryData(['mypage', 'goals'], data);
      queryClient.invalidateQueries({ queryKey: ['mypage', 'summary'] });
    },
    onError: (error) => {
      console.error('Goals update error:', error);
    }
  });
};

// 학습 관리 메뉴 데이터 조회
export const useLearningManagement = () => {
  return useQuery({
    queryKey: ['mypage', 'learning-management'],
    queryFn: () => mypageService.getLearningManagement(),
    staleTime: 5 * 60 * 1000, // 5분
    retry: 2
  });
};

// 아바타 시스템 데이터 조회
export const useAvatarSystem = () => {
  return useQuery({
    queryKey: ['mypage', 'avatar-system'],
    queryFn: () => mypageService.getAvatarSystem(),
    staleTime: 30 * 60 * 1000, // 30분 (자주 변경되지 않음)
    retry: 2
  });
};

// 아바타 변경
export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (avatar) => mypageService.updateAvatar(avatar),
    onSuccess: (data) => {
      // 관련 캐시 업데이트
      queryClient.invalidateQueries({ queryKey: ['mypage', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['mypage', 'avatar-system'] });
    },
    onError: (error) => {
      console.error('Avatar update error:', error);
    }
  });
};

// 앱 설정 토글
export const useToggleAppSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ settingId, value }) => mypageService.toggleAppSetting(settingId, value),
    onSuccess: (data) => {
      // 설정 관련 캐시 갱신
      queryClient.invalidateQueries({ queryKey: ['mypage'] });
    },
    onError: (error) => {
      console.error('App setting toggle error:', error);
    }
  });
};

// 로그아웃
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => mypageService.logout(),
    onSuccess: () => {
      // 모든 캐시 클리어
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout error:', error);
    }
  });
};

// MyPage 전체 데이터를 한번에 가져오는 통합 훅
export const useAllMypageData = () => {
  const profileQuery = useMypageProfile();
  const summaryQuery = useMypageSummary();
  const goalsQuery = useLearningGoals();
  const managementQuery = useLearningManagement();
  const avatarQuery = useAvatarSystem();

  return {
    profile: profileQuery.data,
    summary: summaryQuery.data,
    goals: goalsQuery.data,
    management: managementQuery.data,
    avatarSystem: avatarQuery.data,
    isLoading: profileQuery.isLoading || summaryQuery.isLoading ||
               goalsQuery.isLoading || managementQuery.isLoading ||
               avatarQuery.isLoading,
    error: profileQuery.error || summaryQuery.error ||
           goalsQuery.error || managementQuery.error ||
           avatarQuery.error,
    refetch: () => {
      profileQuery.refetch();
      summaryQuery.refetch();
      goalsQuery.refetch();
      managementQuery.refetch();
      avatarQuery.refetch();
    }
  };
};