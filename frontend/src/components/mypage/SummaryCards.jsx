import React from 'react';

const SummaryCards = ({ summary }) => {
  if (!summary) return null;

  const cards = [
    {
      value: summary.todayQuestions || 0,
      label: '오늘 학습한 문제',
      suffix: ''
    },
    {
      value: summary.weeklyAttendance || 0,
      label: '주간 출석일',
      suffix: ''
    },
    {
      value: summary.weeklyQuestions || 0,
      label: '주간 학습한 문제',
      suffix: ''
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mx-4 -mt-4 relative z-10 md:mx-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white p-4 rounded-xl text-center shadow-lg">
          <span className="block text-2xl font-bold text-primary mb-1">
            {card.value}{card.suffix}
          </span>
          <span className="text-xs text-text-secondary">{card.label}</span>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;