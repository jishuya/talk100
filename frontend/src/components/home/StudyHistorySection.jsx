import { getIcon } from '../../utils/iconMap.jsx';

const StudyHistorySection = ({ historyItems }) => {
  const baseHistory = [
    {
      id: 1,
      icon: 'tabler:bulb',
      title: 'Model Example',
      category: 1
    },
    {
      id: 2,
      icon: 'tabler:message-circle',
      title: 'Small Talk',
      category: 2
    },
    {
      id: 3,
      icon: 'tabler:file-text',
      title: 'Cases in Point',
      category: 3
    }
  ];

  // historyItems에서 백엔드 데이터를 id로 매칭하여 합치기
  const history = baseHistory.map(baseItem => {
    const dynamicItem = historyItems?.find(item => item.id === baseItem.id);

    // 카테고리 진행률 계산
    const categoryCompleted = dynamicItem?.category_completed || 0;
    const categoryTotal = dynamicItem?.category_total || 1;
    const progress = Math.round((categoryCompleted / categoryTotal) * 100);

    const result = {
      ...baseItem,
      time: dynamicItem?.time || '-',
      lastDay: dynamicItem?.last_day || null,
      lastQuestionNumber: dynamicItem?.last_question_number || null,
      categoryCompleted,
      categoryTotal,
      progress
    };

    return result;
  });

  return (
    <div className="px-4 pb-3 md:pb-5">
       <h2 className="text-sm font-bold mb-2 text-text-primary md:text-base md:mb-3">최근 학습</h2>

      <div className="history-card p-2 md:p-4">
        {history.map((item) => (
          <div
            key={item.id}
            className="py-2 md:py-3 border-b border-gray-border last:border-b-0"
          >
            <div className="flex items-center mb-1.5 md:mb-2">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-accent-pale rounded-full flex items-center justify-center mr-3">
                {typeof item.icon === 'string' ? getIcon(item.icon, {
                  size: 'xl',
                  className: item.category === 1 ? 'text-green-400' :
                            item.category === 2 ? 'text-purple-400' :
                            item.category === 3 ? 'text-blue-400' : ''
                }) : item.icon}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-text-primary mb-0.5 md:mb-0.5">
                  {item.title}
                  {item.lastDay && item.lastQuestionNumber && (
                    <span className="font-normal text-xs text-text-secondary ml-1.5 md:text-sm md:font-semibold md:text-text-primary md:ml-0">
                      <span className="md:hidden">D{item.lastDay} Q{item.lastQuestionNumber}</span>
                      <span className="hidden md:inline"> Day {item.lastDay}, Question {item.lastQuestionNumber}</span>
                    </span>
                  )}
                </div>
                <div className="text-xs text-text-secondary">{item.time}</div>
              </div>
              <div className="text-xs text-text-secondary ml-2">
                {item.progress}% ({item.categoryCompleted}/{item.categoryTotal})
              </div>
            </div>

            {/* 진행률 바 */}
            <div className="h-1.5 md:h-2 bg-accent-mint rounded overflow-hidden ml-[48px] md:ml-[52px]">
              <div
                className="h-full bg-primary rounded transition-all duration-500 ease-out"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyHistorySection;