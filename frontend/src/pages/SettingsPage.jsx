import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Settings 관련 훅들
import { useSettingsData, useUpdateSettings } from '../hooks/useApi';

// Settings 컴포넌트들
import SettingsHeader from '../components/settings/SettingsHeader';
import SettingsSection from '../components/settings/SettingsSection';
import TimeModal from '../components/settings/TimeModal';
import DangerZone from '../components/settings/DangerZone';

const SettingsPage = () => {
  const navigate = useNavigate();

  // 데이터 훅들
  const { data: allSettings, isLoading, error, refetch } = useSettingsData();

  // 액션 훅들
  const saveAllMutation = useUpdateSettings();

  // 로컬 상태 (설정값들)
  const [localSettings, setLocalSettings] = useState({
    learning: {},
    notifications: {},
    display: {}
  });

  // 모달 상태
  const [showTimeModal, setShowTimeModal] = useState(false);

  // 설정 초기화
  useEffect(() => {
    if (allSettings) {
      setLocalSettings({
        learning: allSettings.learning || {},
        notifications: allSettings.notifications || {},
        display: allSettings.display || {}
      });
    }
  }, [allSettings]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent-pale">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">설정을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent-pale">
        <div className="text-center">
          <p className="text-red-500 mb-4">설정을 불러오는데 실패했습니다.</p>
          <button onClick={refetch} className="btn-primary">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // ================================================================
  // 헬퍼 함수들
  // ================================================================

  const formatReminderTime = (time) => {
    if (!time) return '오후 8:00';
    const { hour, minute } = time;
    const period = hour >= 12 ? '오후' : '오전';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    const displayMinute = minute.toString().padStart(2, '0');
    return `${period} ${displayHour}:${displayMinute}`;
  };


  const getThemeLabel = (theme) => {
    const labels = { light: '라이트', dark: '다크', auto: '자동' };
    return labels[theme] || '라이트';
  };

  const getFontSizeLabel = (size) => {
    const labels = { small: '작게', medium: '보통', large: '크게' };
    return labels[size] || '보통';
  };

  // ================================================================
  // 이벤트 핸들러들
  // ================================================================

  // 뒤로가기
  const handleBackClick = () => {
    navigate(-1);
  };

  // 설정값 변경
  const handleSettingChange = (category, key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  // 전체 설정 저장
  const handleSaveSettings = async () => {
    try {
      await saveAllMutation.mutateAsync(localSettings);
      alert('설정이 저장되었습니다.');
    } catch (error) {
      console.error('Settings save error:', error);
      alert('설정 저장에 실패했습니다.');
    }
  };

  // 시간 설정 저장
  const handleTimeSave = (time) => {
    handleSettingChange('notifications', 'reminderTime', time);
  };

  // 데이터 백업
  const handleBackupData = async () => {
    alert('백업 기능은 추후 구현될 예정입니다.');
  };

  // 데이터 내보내기
  const handleExportData = async () => {
    alert('내보내기 기능은 추후 구현될 예정입니다.');
  };

  // 캐시 삭제
  const handleClearCache = async () => {
    if (window.confirm('캐시를 삭제하시겠습니까?')) {
      alert('캐시가 삭제되었습니다.');
    }
  };

  // 학습 기록 초기화
  const handleResetProgress = async () => {
    alert('학습 기록 초기화 기능은 추후 구현될 예정입니다.');
  };

  // 계정 삭제
  const handleDeleteAccount = async (reason) => {
    alert('계정 삭제 기능은 추후 구현될 예정입니다.');
  };

  // 설정 항목 클릭 처리
  const handleItemClick = (item) => {
    switch (item.id) {
      case 'reminderTime':
        setShowTimeModal(true);
        break;
      case 'profileEdit':
        navigate('/profile/edit');
        break;
      case 'passwordChange':
        navigate('/password/change');
        break;
      case 'connectedAccount':
        navigate('/account/connections');
        break;
      case 'backup':
        handleBackupData();
        break;
      case 'export':
        handleExportData();
        break;
      case 'clearCache':
        handleClearCache();
        break;
      default:
        break;
    }
  };

  // ================================================================
  // 설정 항목 데이터 구성
  // ================================================================

  const accountItems = [
    {
      id: 'profileEdit',
      title: '프로필 수정',
      description: '닉네임, 프로필 사진 변경',
      type: 'link'
    },
    {
      id: 'passwordChange',
      title: '비밀번호 변경',
      type: 'link'
    },
    {
      id: 'connectedAccount',
      title: '연결된 계정',
      rightText: allSettings?.account?.connectedAccounts?.[0]?.provider,
      type: 'link'
    }
  ];

  const learningItems = [
    {
      id: 'difficulty',
      title: '난이도',
      description: '채점 기준: 초급 50%, 중급 70%, 고급 90%',
      type: 'buttonGroup',
      value: localSettings.learning.difficulty,
      options: [
        { value: 1, label: '초급' },
        { value: 2, label: '중급' },
        { value: 3, label: '고급' }
      ]
    },
    {
      id: 'voiceSpeed',
      title: '음성 재생 속도',
      displayValue: `${localSettings.learning.voiceSpeed}x`,
      type: 'slider',
      value: localSettings.learning.voiceSpeed,
      min: 0.5,
      max: 2,
      step: 0.25,
      sliderLabels: ['0.5x', '1.0x', '2.0x']
    },
    {
      id: 'reviewCount',
      title: '복습 문제 개수',
      description: 'Day 복습 시 출제되는 문제 개수',
      displayValue: `${localSettings.learning.reviewCount}개`,
      type: 'slider',
      value: localSettings.learning.reviewCount,
      min: 3,
      max: 10,
      step: 1,
      sliderLabels: ['3개', '6개', '10개']
    },
    {
      id: 'autoPlay',
      title: '자동 음성 재생',
      description: '문제 표시 시 자동으로 음성 재생',
      type: 'toggle',
      value: localSettings.learning.autoPlay,
      borderBottom: false
    }
  ];

  const notificationItems = [
    {
      id: 'learningReminder',
      title: '학습 리마인더',
      type: 'toggle',
      value: localSettings.notifications.learningReminder
    },
    {
      id: 'reminderTime',
      title: '알림 시간',
      description: '매일 학습 알림을 받을 시간',
      rightText: formatReminderTime(localSettings.notifications.reminderTime),
      type: 'link'
    },
    {
      id: 'reviewReminder',
      title: '복습 알림',
      description: '복습 예정일에 알림',
      type: 'toggle',
      value: localSettings.notifications.reviewReminder
    },
    {
      id: 'weeklyReport',
      title: '주간 리포트',
      description: '매주 일요일 학습 통계 알림',
      type: 'toggle',
      value: localSettings.notifications.weeklyReport,
      borderBottom: false
    }
  ];

  const displayItems = [
    {
      id: 'theme',
      title: '테마',
      displayValue: getThemeLabel(localSettings.display.theme),
      type: 'buttonGroup',
      value: localSettings.display.theme,
      options: [
        { value: 'light', label: '라이트' },
        { value: 'dark', label: '다크' },
        { value: 'auto', label: '자동' }
      ]
    },
    {
      id: 'fontSize',
      title: '글꼴 크기',
      displayValue: getFontSizeLabel(localSettings.display.fontSize),
      type: 'buttonGroup',
      value: localSettings.display.fontSize,
      options: [
        { value: 'small', label: '작게' },
        { value: 'medium', label: '보통' },
        { value: 'large', label: '크게' }
      ],
      borderBottom: false
    }
  ];

  const dataItems = [
    {
      id: 'backup',
      title: '학습 기록 백업',
      description: '클라우드에 학습 데이터 저장',
      type: 'button'
    },
    {
      id: 'export',
      title: '데이터 내보내기',
      description: 'CSV 형식으로 다운로드',
      type: 'button'
    },
    {
      id: 'clearCache',
      title: '캐시 삭제',
      rightText: `${allSettings?.data?.cacheSize} MB`,
      type: 'button',
      borderBottom: false
    }
  ];

  // ================================================================
  // 렌더링
  // ================================================================

  return (
    <div className="min-h-screen bg-accent-pale">
      {/* 헤더
      <SettingsHeader
        onBackClick={handleBackClick}
        onSaveClick={handleSaveSettings}
        isSaving={saveAllMutation.isPending}
      /> */}

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-4 pb-10 md:p-6">
        {/* 계정 관리 */}
        <SettingsSection
          title="계정 관리"
          items={accountItems}
          onItemClick={handleItemClick}
        />

        {/* 학습 설정 */}
        <SettingsSection
          title="학습 설정"
          items={learningItems}
          onItemChange={(key, value) => handleSettingChange('learning', key, value)}
          onItemClick={handleItemClick}
        />

        {/* 알림 설정 */}
        <SettingsSection
          title="알림 설정"
          items={notificationItems}
          onItemChange={(key, value) => handleSettingChange('notifications', key, value)}
          onItemClick={handleItemClick}
        />

        {/* 화면 설정 */}
        <SettingsSection
          title="화면 설정"
          items={displayItems}
          onItemChange={(key, value) => handleSettingChange('display', key, value)}
          onItemClick={handleItemClick}
        />

        {/* 데이터 관리 */}
        <SettingsSection
          title="데이터 관리"
          items={dataItems}
          onItemClick={handleItemClick}
        />

        {/* 위험 영역 */}
        <DangerZone
          onResetProgress={handleResetProgress}
          onDeleteAccount={handleDeleteAccount}
        />
      </main>

      {/* 시간 설정 모달 */}
      <TimeModal
        isOpen={showTimeModal}
        onClose={() => setShowTimeModal(false)}
        initialTime={localSettings.notifications.reminderTime}
        onSave={handleTimeSave}
      />
    </div>
  );
};

export default SettingsPage;