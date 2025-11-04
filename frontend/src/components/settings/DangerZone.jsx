import { Button } from '../ui/Button';
import { getIcon } from '../../utils/iconMap';

const DangerZone = ({ onResetProgress, onDeleteAccount }) => {
  // 모달을 열도록 부모 컴포넌트에 위임
  const handleResetProgress = () => {
    onResetProgress();
  };

  const handleDeleteAccount = () => {
    onDeleteAccount();
  };

  return (
    <div className="bg-white border border-red-500 rounded-2xl p-4 mt-6">
      <div className="text-sm font-semibold text-red-500 mb-3 flex items-center gap-2">
        {getIcon('noto:warning', { size: 'lg' })}
        주의가 필요한 작업
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