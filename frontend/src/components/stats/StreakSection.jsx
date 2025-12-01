import { getIcon } from '../../utils/iconMap';

const StreakSection = ({ data }) => {
  if (!data) return null;

  return (
    <div className="bg-white rounded-2xl p-4 mb-3 shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
{getIcon('noto:fire', { size: 'xl' })}
          <span>연속 학습</span>
        </h2>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="text-5xl font-bold text-primary leading-none">
            {data.current}
          </div>
          <div className="text-sm text-text-secondary mt-1">현재 연속 일수</div>
        </div>
        <div className="text-5xl animate-pulse">
{getIcon('noto:fire', { size: '5xl' })}
        </div>
        <div className="px-3 py-2 bg-accent-pale rounded-xl text-center">
          <div className="text-xs text-text-secondary">최고 기록</div>
          <div className="text-xl font-bold text-text-primary">
            {data.best}일
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakSection;