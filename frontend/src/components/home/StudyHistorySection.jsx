import React from 'react';
import { MOCK_HOME_DATA } from '../../mocks/homePageData';
import { HistoryCard } from '../ui';

const StudyHistorySection = ({ historyItems, onHistoryItemClick }) => {
  // Mock 데이터를 fallback으로 사용 (API 실패시)
  const history = historyItems || MOCK_HOME_DATA.history;

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
      <HistoryCard>
        {history.map((item) => (
          <div
            key={item.id}
            className="flex items-center py-3 border-b border-gray-border last:border-b-0 touchable"
            onClick={() => handleItemClick(item)}
          >
            <div className="w-10 h-10 bg-accent-pale rounded-full flex items-center justify-center text-xl mr-3">
              {item.icon}
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
      </HistoryCard>
    </div>
  );
};

export default StudyHistorySection;