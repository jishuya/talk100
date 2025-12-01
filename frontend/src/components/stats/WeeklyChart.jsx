import { getIcon } from '../../utils/iconMap';

const WeeklyChart = ({ data, period = 'week' }) => {
  if (!data || !Array.isArray(data)) return null;

  const maxCount = Math.max(...data.map(item => item.count));

  // 기간별 제목 설정
  const getTitle = () => {
    if (period === 'week') {
      return '요일별 학습한 문제';
    } else {
      return '요일별 평균 학습한 문제';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 mb-3 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
{getIcon('noto:bar-chart', { size: 'xl' })}
          <span>{getTitle()}</span>
        </h2>
      </div>
      <div className="flex justify-between items-end h-[100px] mb-2">
        {data.map((item, index) => {
          const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
          const isHighActivity = height >= 80;

          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full h-[80px] flex items-end justify-center">
                <div
                  className={`
                    w-[70%] rounded-t relative transition-all duration-500 ease-out
                    ${isHighActivity ? 'bg-primary' : 'bg-primary-light'}
                  `}
                  style={{ height: `${height}%` }}
                >
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-semibold text-text-primary">
                    {item.count}
                  </span>
                </div>
              </div>
              <span className="text-xs text-text-secondary">{item.day}</span>
            </div>
          );
        })}
      </div>
      <div className="text-center text-text-secondary text-xs mt-2">
        가장 활발한 요일: {data
          .filter(item => item.count === maxCount)
          .map(item => item.day)
          .join(', ')
        }
      </div>
    </div>
  );
};

export default WeeklyChart;