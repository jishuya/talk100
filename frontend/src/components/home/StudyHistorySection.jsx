import React from 'react';

const StudyHistorySection = ({ historyItems, onHistoryItemClick }) => {
  const defaultHistoryItems = [
    {
      id: 1,
      icon: '📝',
      title: 'Model Example Day 1',
      time: '10분 전',
      score: 85,
      category: 'model-example',
      day: 1
    },
    {
      id: 2,
      icon: '🗣️',
      title: 'Small Talk Day 3',
      time: '2시간 전',
      score: 92,
      category: 'small-talk',
      day: 3
    },
    {
      id: 3,
      icon: '💼',
      title: 'Cases in Point Day 2',
      time: '어제',
      score: 78,
      category: 'cases-in-point',
      day: 2
    }
  ];

  const history = historyItems || defaultHistoryItems;

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