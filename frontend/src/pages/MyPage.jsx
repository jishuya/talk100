import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

// MyPage 관련 훅들
import {
  useMypageData,
  useUpdateGoals,
  useUpdateAvatar,
  useLogout
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

const MyPage = () => {
  const navigate = useNavigate();


  // 데이터 훅들
  const { data: apiMypageData, isLoading, error, refetch } = useMypageData();

  // 액션 훅들
  const updateGoalsMutation = useUpdateGoals();
  const updateAvatarMutation = useUpdateAvatar();
  const logoutMutation = useLogout();

  // Mock 데이터를 fallback으로 사용
  const finalMypageData = apiMypageData || mypageData;

  // 데이터에서 값 추출
  const profile = finalMypageData?.userProfile;
  const summary = finalMypageData?.summaryStats;
  const goals = finalMypageData?.learningGoals;
  const management = finalMypageData?.learningManagement;
  const avatarSystem = finalMypageData?.avatarSystem;


  // 모달 상태
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showGoalEditModal, setShowGoalEditModal] = useState(false);

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
      await toggleSettingMutation.mutateAsync({ settingId, value });
    } catch (error) {
      console.error('Setting toggle error:', error);
      alert('설정 변경에 실패했습니다.');
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
    const feedback = window.prompt('개선사항이나 의견을 남겨주세요:');
    if (feedback) {
      alert('소중한 의견 감사합니다!');
    }
  };

  // 도움말
  const handleHelp = () => {
    navigate('/help');
  };

  // 앱 설정 항목 클릭 처리
  const handleAppSettingClick = (item) => {
    switch (item.id) {
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
        <MenuSection
          title="학습 관리"
          items={management}
          onItemClick={handleLearningManagementClick}
        />

        {/* 앱 설정 */}
        <MenuSection
          title="앱 설정"
          items={profile?.appSettings || []}
          onItemClick={handleAppSettingClick}
          onToggleChange={handleAppSettingToggle}
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
          © 2024 talk100. All rights reserved.
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
      </div>
    </div>
  );
};

export default MyPage;