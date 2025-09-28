import React from 'react';
import { getIcon } from '../../utils/iconMap.jsx';

const StudyHistorySection = ({ historyItems, onHistoryItemClick }) => {
  const baseHistory = [
    {
      id: 1,
      icon: 'tabler:bulb',
      title: 'Model Example Day 1',
      category: 1
    },
    {
      id: 2,
      icon: 'tabler:message-circle',
      title: 'Small Talk Day 3',
      category: 2
    },
    {
      id: 3,
      icon: 'tabler:file-text',
      title: 'Cases in Point Day 2',
      category: 3
    }
  ];

  // historyItems에서 time, score 값을 id로 매칭하여 합치기
  const history = baseHistory.map(baseItem => {
    const dynamicItem = historyItems?.find(item => item.id === baseItem.id);
    return {
      ...baseItem,
      time: dynamicItem?.time || '-',
      score: dynamicItem?.score || 0
    };
  });

  const handleItemClick = (item) => {
    if (onHistoryItemClick) {
      onHistoryItemClick(item);
    }
  };

  const getScoreColorClass = (score) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="px-4 pb-5">
      <h2 className="text-base font-bold mb-3 text-text-primary">최근 학습</h2>
      <div className="history-card">
        {history.map((item) => (
          <div
            key={item.id}
            className="flex items-center py-3 border-b border-gray-border last:border-b-0 touchable"
            onClick={() => handleItemClick(item)}
          >
            <div className="w-10 h-10 bg-accent-pale rounded-full flex items-center justify-center mr-3">
              {typeof item.icon === 'string' ? getIcon(item.icon, {
                size: 'xl',
                className: item.category === 1 ? 'text-green-400' :
                          item.category === 2 ? 'text-purple-400' :
                          item.category === 3 ? 'text-blue-400' : ''
              }) : item.icon}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-text-primary mb-0.5">{item.title}</div>
              <div className="text-xs text-text-secondary">{item.time}</div>
            </div>
            <div className={`text-sm font-bold ${getScoreColorClass(item.score)}`}>
              {item.score}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyHistorySection;