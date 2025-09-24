import { getIcon } from '../../utils/iconMap';

const WeeklyChart = ({ data }) => {
  if (!data || !Array.isArray(data)) return null;

  const maxCount = Math.max(...data.map(item => item.count));

  return (
    <div className="bg-white rounded-2xl p-5 mb-4 shadow-lg">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
{getIcon('noto:bar-chart', { size: 'xl' })}
          <span>주간 출석 패턴</span>
        </h2>
      </div>
      <div className="flex justify-between items-end h-[120px] mb-3">
        {data.map((item, index) => {
          const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
          const isHighActivity = height >= 80;

          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full h-[100px] flex items-end justify-center">
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