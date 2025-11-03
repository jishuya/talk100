import React from 'react';

const SummaryCards = ({ summary }) => {
  if (!summary) return null;

  const cards = [
    {
      value: summary.totalDays,
      label: '총 학습일',
      suffix: ''
    },
    {
      value: summary.streakDays,
      label: '현재 연속일수',
      suffix: ''
    },
    {
      value: summary.maxStreakDays,
      label: '최장 연속일',
      suffix: ''
    },
    
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