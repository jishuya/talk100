import React from 'react';
import { Button } from '../ui/Button';

const DangerZone = ({ onResetProgress, onDeleteAccount }) => {
  const handleResetProgress = () => {
    if (window.confirm('정말로 모든 학습 기록을 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      if (window.confirm('한 번 더 확인합니다.\n모든 학습 기록이 삭제됩니다.')) {
        onResetProgress();
      }
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('정말로 계정을 삭제하시겠습니까?\n모든 데이터가 영구적으로 삭제됩니다.')) {
      const reason = window.prompt('계정 삭제 사유를 알려주세요 (선택사항):');
      if (reason !== null) { // 사용자가 취소하지 않았다면
        onDeleteAccount(reason);
      }
    }
  };

  return (
    <div className="bg-white border border-red-500 rounded-2xl p-4 mt-6">
      <div className="text-sm font-semibold text-red-500 mb-3">
        ⚠️ 주의가 필요한 작업
      </div>

      <Button
        variant="secondary"
        className="w-full py-3 mb-2 text-red-500 border-red-500 hover:bg-red-50"
        onClick={handleResetProgress}
      >
        학습 기록 초기화
      </Button>

      <Button
        variant="secondary"
        className="w-full py-3 text-red-500 border-red-500 hover:bg-red-50"
        onClick={handleDeleteAccount}
      >
        계정 삭제
      </Button>
    </div>
  );
};

export default DangerZone;