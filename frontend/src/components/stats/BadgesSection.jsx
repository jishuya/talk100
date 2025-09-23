import { getIcon } from '../../utils/iconMap';

const BadgesSection = ({ data }) => {
  if (!data || !Array.isArray(data)) return null;

  const handleBadgeClick = (badge) => {
    if (badge.earned) {
      alert(`🎉 "${badge.name}" 뱃지를 획득하셨습니다!\n${badge.description}`);
    } else {
      alert(`"${badge.name}" 뱃지 획득 조건:\n${badge.description}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
{getIcon('IoTrophy', { size: 'xl' })}
          <span>성취 뱃지</span>
        </h2>
      </div>
      <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
        {data.map((badge) => (
          <div
            key={badge.id}
            onClick={() => handleBadgeClick(badge)}
            className={`
              p-4 rounded-xl text-center cursor-pointer transition-all duration-300 active:scale-95
              ${badge.earned
                ? 'bg-gradient-badge'
                : 'bg-accent-pale opacity-60'
              }
            `}
          >
            <div className="text-3xl mb-2">{badge.icon}</div>
            <div className="text-xs text-text-primary font-medium">
              {badge.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BadgesSection;