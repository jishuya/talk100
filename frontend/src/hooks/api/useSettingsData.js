import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../../services/settingsService';

// 전체 설정 조회
export const useAllSettings = () => {
  return useQuery({
    queryKey: ['settings', 'all'],
    queryFn: () => settingsService.getAllSettings(),
    staleTime: 5 * 60 * 1000, // 5분
    retry: 2
  });
};

// 계정 설정 조회
export const useAccountSettings = () => {
  return useQuery({
    queryKey: ['settings', 'account'],
    queryFn: () => settingsService.getAccountSettings(),
    staleTime: 10 * 60 * 1000, // 10분
    retry: 2
  });
};

// 학습 설정 조회
export const useLearningSettings = () => {
  return useQuery({
    queryKey: ['settings', 'learning'],
    queryFn: () => settingsService.getLearningSettings(),
    staleTime: 5 * 60 * 1000, // 5분
    retry: 2
  });
};

// 알림 설정 조회
export const useNotificationSettings = () => {
  return useQuery({
    queryKey: ['settings', 'notifications'],
    queryFn: () => settingsService.getNotificationSettings(),
    staleTime: 5 * 60 * 1000, // 5분
    retry: 2
  });
};

// 화면 설정 조회
export const useDisplaySettings = () => {
  return useQuery({
    queryKey: ['settings', 'display'],
    queryFn: () => settingsService.getDisplaySettings(),
    staleTime: 10 * 60 * 1000, // 10분
    retry: 2
  });
};

// 설정 옵션 조회
export const useSettingOptions = () => {
  return useQuery({
    queryKey: ['settings', 'options'],
    queryFn: () => settingsService.getSettingOptions(),
    staleTime: 60 * 60 * 1000, // 1시간 (거의 변경되지 않음)
    retry: 2
  });
};

// 학습 설정 업데이트
export const useUpdateLearningSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings) => settingsService.updateLearningSettings(settings),
    onSuccess: (data) => {
      queryClient.setQueryData(['settings', 'learning'], data);
      queryClient.invalidateQueries({ queryKey: ['settings', 'all'] });
    },
    onError: (error) => {
      console.error('Learning settings update error:', error);
    }
  });
};

// 알림 설정 업데이트
export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings) => settingsService.updateNotificationSettings(settings),
    onSuccess: (data) => {
      queryClient.setQueryData(['settings', 'notifications'], data);
      queryClient.invalidateQueries({ queryKey: ['settings', 'all'] });
    },
    onError: (error) => {
      console.error('Notification settings update error:', error);
    }
  });
};

// 화면 설정 업데이트
export const useUpdateDisplaySettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings) => settingsService.updateDisplaySettings(settings),
    onSuccess: (data) => {
      queryClient.setQueryData(['settings', 'display'], data);
      queryClient.invalidateQueries({ queryKey: ['settings', 'all'] });
    },
    onError: (error) => {
      console.error('Display settings update error:', error);
    }
  });
};

// 계정 정보 업데이트
export const useUpdateAccountInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (info) => settingsService.updateAccountInfo(info),
    onSuccess: (data) => {
      queryClient.setQueryData(['settings', 'account'], data);
      queryClient.invalidateQueries({ queryKey: ['settings', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['mypage', 'profile'] }); // MyPage 프로필도 갱신
    },
    onError: (error) => {
      console.error('Account info update error:', error);
    }
  });
};

// 데이터 백업
export const useBackupData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => settingsService.backupData(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      return data;
    },
    onError: (error) => {
      console.error('Backup error:', error);
    }
  });
};

// 데이터 내보내기
export const useExportData = () => {
  return useMutation({
    mutationFn: () => settingsService.exportData(),
    onSuccess: (data) => {
      // 파일 다운로드 처리
      if (data.downloadUrl) {
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(data.downloadUrl);
      }
      return data;
    },
    onError: (error) => {
      console.error('Export error:', error);
    }
  });
};

// 캐시 삭제
export const useClearCache = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => settingsService.clearCache(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      return data;
    },
    onError: (error) => {
      console.error('Clear cache error:', error);
    }
  });
};

// 학습 기록 초기화
export const useResetProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => settingsService.resetProgress(),
    onSuccess: (data) => {
      // 모든 학습 관련 캐시 클리어
      queryClient.invalidateQueries({ queryKey: ['mypage'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      return data;
    },
    onError: (error) => {
      console.error('Reset progress error:', error);
    }
  });
};

// 계정 삭제
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason) => settingsService.deleteAccount(reason),
    onSuccess: (data) => {
      // 모든 캐시 클리어
      queryClient.clear();
      return data;
    },
    onError: (error) => {
      console.error('Delete account error:', error);
    }
  });
};

// 설정 저장 (전체 설정을 한번에)
export const useSaveAllSettings = () => {
  const updateLearning = useUpdateLearningSettings();
  const updateNotifications = useUpdateNotificationSettings();
  const updateDisplay = useUpdateDisplaySettings();

  return useMutation({
    mutationFn: async ({ learning, notifications, display }) => {
      const results = await Promise.allSettled([
        learning && updateLearning.mutateAsync(learning),
        notifications && updateNotifications.mutateAsync(notifications),
        display && updateDisplay.mutateAsync(display)
      ].filter(Boolean));

      const errors = results
        .filter(result => result.status === 'rejected')
        .map(result => result.reason);

      if (errors.length > 0) {
        throw new Error(`일부 설정 저장에 실패했습니다: ${errors.join(', ')}`);
      }

      return { success: true, message: '설정이 저장되었습니다.' };
    },
    onError: (error) => {
      console.error('Save all settings error:', error);
    }
  });
};