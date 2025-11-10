import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Settings 관련 훅들
import { useMypageData, useUpdateProfile, useUpdateVoiceGender } from '../hooks/useApi';
import { api } from '../services/apiService';

// Settings 컴포넌트들
import SettingsSection from '../components/settings/SettingsSection';
import DangerZone from '../components/settings/DangerZone';
import ProfileEditModal from '../components/settings/ProfileEditModal';
import ConfirmModal from '../components/settings/ConfirmModal';

const SettingsPage = () => {
  const queryClient = useQueryClient();

  // MyPage 데이터 가져오기 (프로필 정보 포함)
  const { data: mypageData } = useMypageData();

  const profile = mypageData?.userProfile;

  // 액션 훅들
  const updateProfileMutation = useUpdateProfile();
  const updateVoiceGenderMutation = useUpdateVoiceGender();

  // 모달 상태
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  // 음성 성별 상태
  const [selectedVoice, setSelectedVoice] = useState('us_male');

  // 캐시 크기 상태
  const [cacheSize, setCacheSize] = useState(0);

  // 캐시 크기 계산 및 음성 초기화 (컴포넌트 마운트 시)
  useEffect(() => {
    setCacheSize(calculateCacheSize());
  }, []);

  // 프로필 데이터가 로드되면 음성 성별 설정
  useEffect(() => {
    if (profile?.voiceGender) {
      setSelectedVoice(profile.voiceGender);
    }
  }, [profile]);

  // ================================================================
  // 헬퍼 함수들
  // ================================================================

  // 캐시 크기 계산
  const calculateCacheSize = () => {
    try {
      let totalSize = 0;

      // LocalStorage 크기 계산
      for (let key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          // JWT 토큰은 제외
          if (key !== 'jwt_token' && key !== 'user_info') {
            const itemSize = localStorage.getItem(key)?.length || 0;
            totalSize += itemSize;
          }
        }
      }

      // SessionStorage 크기 계산
      for (let key in sessionStorage) {
        if (Object.prototype.hasOwnProperty.call(sessionStorage, key)) {
          const itemSize = sessionStorage.getItem(key)?.length || 0;
          totalSize += itemSize;
        }
      }

      // 바이트를 MB로 변환 (대략적인 계산: 1 char = 2 bytes)
      const sizeInMB = (totalSize * 2 / (1024 * 1024)).toFixed(2);
      return sizeInMB;
    } catch (error) {
      console.error('Cache size calculation error:', error);
      return '0.00';
    }
  };

  // ================================================================
  // 이벤트 핸들러들
  // ================================================================

  // 데이터 백업 (JSON 파일 다운로드)
  const handleBackupData = async () => {
    try {
      // 백업 데이터 조회
      const backupData = await api.getBackupData();

      // JSON 문자열로 변환 (들여쓰기 포함)
      const jsonString = JSON.stringify(backupData, null, 2);

      // Blob 생성
      const blob = new Blob([jsonString], { type: 'application/json' });

      // 다운로드 링크 생성
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // 파일명: talk100_backup_YYYYMMDD_HHMMSS.json
      const now = new Date();
      const dateString = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
      link.download = `talk100_backup_${dateString}.json`;

      // 다운로드 실행
      document.body.appendChild(link);
      link.click();

      // 정리
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('백업 파일이 다운로드되었습니다.');
    } catch (error) {
      console.error('Backup error:', error);
      alert('백업에 실패했습니다.');
    }
  };

  // 데이터 내보내기 (CSV 파일 다운로드)
  const handleExportData = async () => {
    try {
      // 내보내기 데이터 조회
      const exportData = await api.getExportData();

      // CSV 생성
      let csvContent = '';

      // UTF-8 BOM 추가 (Excel에서 한글 깨짐 방지)
      const BOM = '\uFEFF';

      // 1. 카테고리별 통계
      csvContent += '=== 카테고리별 통계 ===\n';
      csvContent += '카테고리 ID,카테고리명,시도한 문제 수,전체 시도 수\n';
      exportData.categoryStats.forEach(stat => {
        csvContent += `${stat.category_id},${stat.category_name},${stat.attempted_questions},${stat.total_attempts}\n`;
      });
      csvContent += '\n';

      // 2. Day별 통계
      csvContent += '=== Day별 통계 ===\n';
      csvContent += '카테고리 ID,Day,시도한 문제 수,전체 시도 수\n';
      exportData.dayStats.forEach(stat => {
        csvContent += `${stat.category_id},${stat.day},${stat.attempted_questions},${stat.total_attempts}\n`;
      });
      csvContent += '\n';

      // 3. 일별 학습 기록 (최근 30일)
      csvContent += '=== 일별 학습 기록 (최근 30일) ===\n';
      csvContent += '날짜,시도한 문제 수,완료한 Day 수,목표 달성 여부\n';
      exportData.dailyStudy.forEach(study => {
        csvContent += `${study.date},${study.questions_attempted},${study.days_completed},${study.goal_met ? '달성' : '미달성'}\n`;
      });
      csvContent += '\n';

      // 4. 문제별 상세 기록
      csvContent += '=== 문제별 상세 기록 ===\n';
      csvContent += '문제 ID,한글 문장,영어 문장,카테고리 ID,Day,문제 번호,시도 횟수,마지막 시도일,즐겨찾기,틀린 문제,틀린 횟수\n';
      exportData.questionDetails.forEach(detail => {
        csvContent += `${detail.question_id},"${detail.korean}","${detail.english}",${detail.category_id},${detail.day},${detail.question_number},${detail.attempt_count},${detail.last_attempted || '-'},${detail.is_favorite ? 'O' : 'X'},${detail.is_wrong_answer ? 'O' : 'X'},${detail.wrong_count || 0}\n`;
      });

      // Blob 생성 (BOM 포함)
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

      // 다운로드 링크 생성
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // 파일명: talk100_export_YYYYMMDD_HHMMSS.csv
      const now = new Date();
      const dateString = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
      link.download = `talk100_export_${dateString}.csv`;

      // 다운로드 실행
      document.body.appendChild(link);
      link.click();

      // 정리
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('CSV 파일이 다운로드되었습니다.');
    } catch (error) {
      console.error('Export error:', error);
      alert('내보내기에 실패했습니다.');
    }
  };

  // 캐시 삭제
  const handleClearCache = async () => {
    const currentSize = calculateCacheSize();

    if (window.confirm(`캐시를 삭제하시겠습니까?\n현재 캐시 크기: ${currentSize} MB`)) {
      try {
        // 1. React Query 캐시 삭제
        queryClient.clear();

        // 2. LocalStorage에서 퀴즈 세션 삭제 (JWT 토큰과 사용자 정보는 보존)
        const keysToRemove = [];
        for (let key in localStorage) {
          if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
            // JWT 토큰과 사용자 정보는 보존
            if (key !== 'jwt_token' && key !== 'user_info') {
              keysToRemove.push(key);
            }
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));

        // 3. SessionStorage 전체 삭제
        sessionStorage.clear();

        // 4. 캐시 크기 재계산
        setCacheSize(calculateCacheSize());

        alert('캐시가 삭제되었습니다.');
      } catch (error) {
        console.error('Cache clear error:', error);
        alert('캐시 삭제에 실패했습니다.');
      }
    }
  };

  // 학습 기록 초기화
  const handleResetProgress = () => {
    setShowResetConfirmModal(true);
  };

  // 학습 기록 초기화 확인
  const confirmResetProgress = async () => {
    try {
      // API 호출
      await api.resetLearningData();

      // React Query 캐시 전체 삭제
      queryClient.clear();

      // LocalStorage에서 퀴즈 세션 삭제
      const keysToRemove = [];
      for (let key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          // JWT 토큰과 사용자 정보는 보존
          if (key !== 'jwt_token' && key !== 'user_info') {
            keysToRemove.push(key);
          }
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // SessionStorage 전체 삭제
      sessionStorage.clear();

      alert('✅ 학습 기록이 초기화되었습니다.\n홈 화면으로 이동합니다.');

      // 홈으로 리다이렉트
      window.location.href = '/';
    } catch (error) {
      console.error('Reset progress error:', error);
      alert('❌ 학습 기록 초기화에 실패했습니다.\n잠시 후 다시 시도해주세요.');
    }
  };

  // 계정 삭제
  const handleDeleteAccount = () => {
    setShowDeleteConfirmModal(true);
  };

  // 계정 삭제 확인
  const confirmDeleteAccount = async () => {
    try {
      // API 호출 - 계정 삭제
      await api.deleteAccount();

      // LocalStorage 전체 삭제 (JWT 토큰 포함)
      localStorage.clear();

      // SessionStorage 전체 삭제
      sessionStorage.clear();

      // React Query 캐시 전체 삭제
      queryClient.clear();

      alert('✅ 계정이 삭제되었습니다.\n그동안 이용해 주셔서 감사합니다.');

      // 로그인 페이지로 리다이렉트
      window.location.href = '/login';
    } catch (error) {
      console.error('Delete account error:', error);
      alert('❌ 계정 삭제에 실패했습니다.\n잠시 후 다시 시도해주세요.');
    }
  };

  // 프로필 저장
  const handleProfileSave = async (profileData) => {
    try {
      await updateProfileMutation.mutateAsync(profileData);
      alert('프로필이 저장되었습니다.');
    } catch (error) {
      console.error('Profile save error:', error);
      alert('프로필 저장에 실패했습니다.');
    }
  };

  // 음성 성별 변경
  const handleVoiceChange = async (voiceGender) => {
    try {
      setSelectedVoice(voiceGender);
      await updateVoiceGenderMutation.mutateAsync(voiceGender);
      console.log('✅ Voice gender updated:', voiceGender);
    } catch (error) {
      console.error('Voice gender update error:', error);
      // 실패 시 이전 값으로 복원
      setSelectedVoice(profile?.voiceGender || 'us_male');
      alert('음성 설정 변경에 실패했습니다.');
    }
  };

  // 설정 항목 클릭 처리
  const handleItemClick = (item) => {
    switch (item.id) {
      case 'profileEdit':
        setShowProfileEditModal(true);
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

  // OAuth 제공자 판단 (백엔드에서 전달받은 정보 사용)
  const getOAuthProvider = () => {
    return profile?.oauthProvider || '-';
  };

  // 음성 옵션 매핑
  const voiceOptions = [
    { value: 'us_female', label: 'Ava (미국 여성)', flag: '🇺🇸' },
    { value: 'us_male', label: 'Andrew (미국 남성)', flag: '🇺🇸' },
    { value: 'uk_female', label: 'Sonia (영국 여성)', flag: '🇬🇧' },
    { value: 'uk_male', label: 'Ryan (영국 남성)', flag: '🇬🇧' }
  ];

  const accountItems = [
    {
      id: 'profileEdit',
      title: '프로필 수정',
      description: '이름, 이메일 변경',
      type: 'link'
    },
    {
      id: 'connectedAccount',
      title: '연결된 계정',
      rightText: getOAuthProvider(),
      type: 'text'
    },
    {
      id: 'voiceGender',
      title: '음성 선택',
      description: '문제 음성 설정',
      type: 'radio',
      value: selectedVoice,
      options: voiceOptions,
      onChange: handleVoiceChange,
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
      rightText: `${cacheSize} MB`,
      type: 'button',
      borderBottom: false
    }
  ];

  // ================================================================
  // 렌더링
  // ================================================================

  return (
    <div className="min-h-screen bg-accent-pale">
      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-4 pb-10 md:p-6">
        {/* 계정 관리 */}
        <SettingsSection
          title="계정 관리"
          items={accountItems}
          onItemClick={handleItemClick}
        />

        {/* 알림 설정 */}
        {/* <SettingsSection
          title="알림 설정"
          items={notificationItems}
          onItemChange={(key, value) => handleSettingChange('notifications', key, value)}
          onItemClick={handleItemClick}
        /> */}

        {/* 화면 설정 */}
        {/* <SettingsSection
          title="화면 설정"
          items={displayItems}
          onItemChange={(key, value) => handleSettingChange('display', key, value)}
          onItemClick={handleItemClick}
        /> */}

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

      {/* 프로필 수정 모달 */}
      <ProfileEditModal
        isOpen={showProfileEditModal}
        onClose={() => setShowProfileEditModal(false)}
        profile={profile}
        onSave={handleProfileSave}
      />

      {/* 학습 기록 초기화 확인 모달 */}
      <ConfirmModal
        isOpen={showResetConfirmModal}
        onClose={() => setShowResetConfirmModal(false)}
        onConfirm={confirmResetProgress}
        title="학습 기록 초기화"
        message="정말로 모든 학습 기록을 초기화하시겠습니까?"
        items={[
          '문제 시도 기록',
          '진행률 (카테고리별)',
          '틀린 문제 목록',
          '즐겨찾기',
          '일일 통계',
          '복습 스케줄',
          '레벨 및 스트릭'
        ]}
        confirmText="초기화"
        cancelText="취소"
        type="danger"
      />

      {/* 계정 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={confirmDeleteAccount}
        title="계정 삭제"
        message="계정을 삭제하면 모든 데이터가 영구적으로 삭제되며, 복구할 수 없습니다."
        items={[
          '사용자 프로필 정보',
          '모든 학습 기록',
          '설정 정보',
          '연결된 OAuth 계정'
        ]}
        confirmText="계정 삭제"
        cancelText="취소"
        type="danger"
      />
    </div>
  );
};

export default SettingsPage;