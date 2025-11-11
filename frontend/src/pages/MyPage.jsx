import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useTheme } from '../contexts/ThemeContext';

// MyPage 관련 훅들
import {
  useMypageData,
  useUpdateGoals,
  useAvatarSystem,
  useUpdateAvatar,
  useLogout,
  useUpdateSettings,
  useUpdateVoiceGender
} from '../hooks/useApi';

// Mock 데이터
import { mypageData } from '../mocks/mypageData';

// MyPage 컴포넌트들
import ProfileHeader from '../components/mypage/ProfileHeader';
import SummaryCards from '../components/mypage/SummaryCards';
import GoalsSection from '../components/mypage/GoalsSection';
import MenuSection from '../components/mypage/MenuSection';
import AvatarModal from '../components/mypage/AvatarModal';
import GoalEditModal from '../components/mypage/GoalEditModal';
import FeedbackModal from '../components/mypage/FeedbackModal';
import HelpModal from '../components/mypage/HelpModal';

const MyPage = () => {
  const navigate = useNavigate();
  const { changeTheme } = useTheme();

  // 데이터 훅들 - 이제 모든 데이터를 useMypageData()에서 가져옴
  const { data: apiMypageData, isLoading, error, refetch } = useMypageData();
  const { data: apiAvatarSystem } = useAvatarSystem();

  // 액션 훅들
  const updateGoalsMutation = useUpdateGoals();
  const updateAvatarMutation = useUpdateAvatar();
  const logoutMutation = useLogout();
  const updateSettingsMutation = useUpdateSettings();
  const updateVoiceGenderMutation = useUpdateVoiceGender();

  // Mock 데이터를 fallback으로 사용
  const finalMypageData = apiMypageData || mypageData;
  const avatarSystem = apiAvatarSystem || mypageData.avatarSystem;

  // 데이터에서 값 추출 - 이제 모두 apiMypageData에서 가져옴
  const profile = finalMypageData?.userProfile;
  const summary = finalMypageData?.summaryStats;
  const goals = finalMypageData?.learningGoals;
  const apiSettings = finalMypageData?.appSettings;

  // 모달 상태
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showGoalEditModal, setShowGoalEditModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showVoiceSpeedModal, setShowVoiceSpeedModal] = useState(false);

  // 앱 설정 로컬 상태
  const [localAppSettings, setLocalAppSettings] = useState([]);

  // apiSettings 데이터가 로드되면 localAppSettings 초기화
  useEffect(() => {
    if (apiSettings && profile) {
      // 백엔드 설정을 UI 형식으로 변환
      const settingsArray = [
        {
          id: 'notifications',
          icon: 'IoNotifications',
          title: '알림',
          description: '학습 알림 설정',
          type: 'button',
          bgColor: 'bg-gray-light'
        },
        {
          id: 'theme',
          icon: 'IoMoon',
          title: '다크 모드',
          type: 'toggle',
          value: apiSettings.display?.theme === 'dark',
          bgColor: 'bg-gray-light'
        },
        {
          id: 'voiceSpeed',
          icon: 'IoSpeedometer',
          title: '음성 속도',
          description: '재생 속도 설정',
          type: 'button',
          bgColor: 'bg-gray-light'
        },
        {
          id: 'voiceGender',
          icon: 'IoMic',
          title: '음성 선택',
          description: '문제 음성 설정',
          type: 'select',
          value: profile.voiceGender || 'us_male',
          options: [
            { value: 'us_female', label: 'Ava (미국 여성)', flag: '🇺🇸' },
            { value: 'us_male', label: 'Andrew (미국 남성)', flag: '🇺🇸' },
            { value: 'uk_female', label: 'Sonia (영국 여성)', flag: '🇬🇧' },
            { value: 'uk_male', label: 'Ryan (영국 남성)', flag: '🇬🇧' }
          ],
          onChange: async (value) => {
            try {
              await updateVoiceGenderMutation.mutateAsync(value);
            } catch (error) {
              console.error('Voice gender update error:', error);
              alert('음성 선택 변경에 실패했습니다.');
            }
          },
          bgColor: 'bg-gray-light'
        },
        {
          id: 'feedback',
          icon: 'noto:speech-balloon',
          title: '피드백 보내기',
          type: 'button',
          bgColor: 'bg-gray-light'
        },
        {
          id: 'help',
          icon: 'noto:information',
          title: '도움말',
          type: 'button',
          borderBottom: false,
          bgColor: 'bg-gray-light'
        }
      ];

      setLocalAppSettings(settingsArray);
    }
  }, [apiSettings, profile]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent-pale">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">마이페이지를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent-pale">
        <div className="text-center">
          <p className="text-red-500 mb-4">데이터를 불러오는데 실패했습니다.</p>
          <Button onClick={refetch} variant="primary">
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  // ================================================================
  // 이벤트 핸들러들
  // ================================================================


  // 아바타 모달 열기
  const handleAvatarClick = () => {
    setShowAvatarModal(true);
  };

  // 목표 수정 모달 열기
  const handleGoalEditClick = () => {
    setShowGoalEditModal(true);
  };

  // 학습 관리 메뉴 클릭
  const handleLearningManagementClick = (item) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  // 앱 설정 토글
  const handleAppSettingToggle = async (settingId, value) => {
    try {
      // 로컬 상태 즉시 업데이트 (Optimistic UI)
      setLocalAppSettings(prev =>
        prev.map(setting =>
          setting.id === settingId ? { ...setting, value } : setting
        )
      );

      // 백엔드 업데이트
      const updateData = {};

      if (settingId === 'theme') {
        // 테마 변경 (HomePage의 달 이모지 클릭과 동일한 로직)
        const newTheme = value ? 'dark' : 'light';
        changeTheme(newTheme);
        updateData.display = { theme: newTheme };
      }

      await updateSettingsMutation.mutateAsync(updateData);
    } catch (error) {
      console.error('Setting toggle error:', error);
      alert('설정 변경에 실패했습니다.');

      // 에러 발생시 이전 상태로 롤백
      if (apiSettings) {
        // 테마도 원래대로 롤백
        if (settingId === 'theme') {
          changeTheme(apiSettings.display?.theme || 'light');
        }

        const settingsArray = [
          {
            id: 'notifications',
            icon: 'IoNotifications',
            title: '알림',
            description: '학습 알림 설정',
            type: 'button',
            bgColor: 'bg-gray-light'
          },
          {
            id: 'theme',
            icon: 'IoMoon',
            title: '다크 모드',
            type: 'toggle',
            value: apiSettings.display?.theme === 'dark',
            bgColor: 'bg-gray-light'
          },
          {
            id: 'voiceSpeed',
            icon: 'IoSpeedometer',
            title: '음성 속도',
            description: '재생 속도 설정',
            type: 'button',
            bgColor: 'bg-gray-light'
          },
          {
            id: 'feedback',
            icon: 'noto:speech-balloon',
            title: '피드백 보내기',
            type: 'button',
            bgColor: 'bg-gray-light'
          },
          {
            id: 'help',
            icon: 'noto:information',
            title: '도움말',
            type: 'button',
            borderBottom: false,
            bgColor: 'bg-gray-light'
          }
        ];
        setLocalAppSettings(settingsArray);
      }
    }
  };


  // 앱 설정 라디오 변경 (음성 선택)
  const handleAppSettingRadio = async (settingId, value) => {
    try {
      // 로컬 상태 즉시 업데이트 (Optimistic UI)
      setLocalAppSettings(prev =>
        prev.map(setting =>
          setting.id === settingId ? { ...setting, value } : setting
        )
      );

      // 백엔드 업데이트
      if (settingId === 'voiceGender') {
        await updateVoiceGenderMutation.mutateAsync(value);
      }
    } catch (error) {
      console.error('Setting radio error:', error);
      alert('음성 선택 변경에 실패했습니다.');

      // 에러 발생시 이전 상태로 롤백
      if (profile) {
        setLocalAppSettings(prev =>
          prev.map(setting =>
            setting.id === settingId
              ? { ...setting, value: profile.voiceGender || 'us_male' }
              : setting
          )
        );
      }
    }
  };

  // 아바타 저장
  const handleAvatarSave = async (avatar) => {
    try {
      await updateAvatarMutation.mutateAsync(avatar);
      alert('아바타가 변경되었습니다!');
    } catch (error) {
      console.error('Avatar update error:', error);
      alert('아바타 변경에 실패했습니다.');
    }
  };

  // 학습 목표 저장
  const handleGoalsSave = async (newGoals) => {
    try {
      await updateGoalsMutation.mutateAsync(newGoals);
      alert('학습 목표가 수정되었습니다!');
    } catch (error) {
      console.error('Goals update error:', error);
      alert('목표 수정에 실패했습니다.');
    }
  };

  // 로그아웃
  const handleLogout = async () => {
    if (window.confirm('정말 로그아웃 하시겠습니까?')) {
      try {
        await logoutMutation.mutateAsync();
        navigate('/login');
      } catch (error) {
        console.error('Logout error:', error);
        alert('로그아웃에 실패했습니다.');
      }
    }
  };

  // 피드백 보내기
  const handleFeedback = () => {
    setShowFeedbackModal(true);
  };

  // 도움말
  const handleHelp = () => {
    setShowHelpModal(true);
  };

  // 앱 설정 항목 클릭 처리
  const handleAppSettingClick = (item) => {
    switch (item.id) {
      case 'notifications':
        setShowNotificationModal(true);
        break;
      case 'voiceSpeed':
        setShowVoiceSpeedModal(true);
        break;
      case 'feedback':
        handleFeedback();
        break;
      case 'help':
        handleHelp();
        break;
      default:
        break;
    }
  };

  // ================================================================
  // 렌더링
  // ================================================================

  return (
    <div className="min-h-screen bg-accent-pale">
      <div className="max-w-2xl mx-auto">
        {/* 프로필 헤더 */}
        <ProfileHeader
          profile={profile}
          onAvatarClick={handleAvatarClick}
        />

        {/* 학습 요약 카드 */}
        <SummaryCards summary={summary} />

        {/* 메인 콘텐츠 */}
        <main className="flex-1 p-4 pb-20 md:p-6">
        {/* 학습 목표 설정 */}
        <GoalsSection
          goals={goals}
          onEditClick={handleGoalEditClick}
        />

        {/* 학습 관리 */}
        {/* <MenuSection
          title="학습 관리"
          items={management}
          onItemClick={handleLearningManagementClick}
        /> */}

        {/* 앱 설정 */}
        <MenuSection
          title="앱 설정"
          items={localAppSettings}
          onItemClick={handleAppSettingClick}
          onToggleChange={handleAppSettingToggle}
          onRadioChange={handleAppSettingRadio}
        />

        {/* 로그아웃 버튼 */}
        <Button
          variant="secondary"
          className="w-full py-3.5 text-red-500 border-red-500 rounded-2xl text-base font-semibold touchable hover:bg-red-50"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? '로그아웃 중...' : '로그아웃'}
        </Button>

        {/* 버전 정보 */}
        <div className="text-center py-5 text-text-secondary text-xs">
          talk100 v1.0.0<br />
          © 2025 talk100. All rights reserved.
        </div>
      </main>

      {/* 아바타 선택 모달 */}
      <AvatarModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        avatarSystem={avatarSystem}
        onSave={handleAvatarSave}
      />

      {/* 목표 수정 모달 */}
      <GoalEditModal
        isOpen={showGoalEditModal}
        onClose={() => setShowGoalEditModal(false)}
        goals={goals}
        onSave={handleGoalsSave}
      />

      {/* 피드백 모달 */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />

      {/* 도움말 모달 */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* 알림 모달 */}
      <HelpModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
      />

      {/* 음성 속도 모달 */}
      <HelpModal
        isOpen={showVoiceSpeedModal}
        onClose={() => setShowVoiceSpeedModal(false)}
      />
      </div>
    </div>
  );
};

export default MyPage;