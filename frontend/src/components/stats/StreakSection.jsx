import { getIcon } from '../../utils/iconMap';

const StreakSection = ({ data }) => {
  if (!data) return null;

  return (
    <div className="bg-white rounded-2xl p-5 mb-4 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
{getIcon('IoTrophy', { size: 'xl', color: 'text-orange-500' })}
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
{getIcon('IoTrophy', { size: '5xl', color: 'text-orange-500' })}
        </div>
        <div className="px-4 py-3 bg-accent-pale rounded-xl text-center">
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