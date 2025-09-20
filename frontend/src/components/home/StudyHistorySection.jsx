import React from 'react';
import { MOCK_HOME_DATA } from '../../mocks/homePageData';

const StudyHistorySection = ({ historyItems, onHistoryItemClick }) => {
  // Mock 데이터를 fallback으로 사용 (API 실패시)
  const history = historyItems || MOCK_HOME_DATA.history;

  const handleItemClick = (item) => {
    if (onHistoryItemClick) {
      onHistoryItemClick(item);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'var(--success)';
    if (score >= 70) return 'var(--warning)';
    return 'var(--error)';
  };

  return (
    <div className="study-history">
      <h2 className="section-title">최근 학습</h2>
      <div className="history-card">
        {history.map((item) => (
          <div
            key={item.id}
            className="history-item touchable"
            onClick={() => handleItemClick(item)}
          >
            <div className="history-icon">{item.icon}</div>
            <div className="history-info">
              <div className="history-title">{item.title}</div>
              <div className="history-time">{item.time}</div>
            </div>
            <div
              className="history-score"
              style={{ color: getScoreColor(item.score) }}
            >
              {item.score}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyHistorySection;