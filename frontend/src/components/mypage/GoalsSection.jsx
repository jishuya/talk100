import React from 'react';
import { Button } from '../ui/Button';

const GoalsSection = ({ goals, onEditClick }) => {
  if (!goals) return null;

  const goalItems = [
    {
      value: goals.dailyGoal,
      label: '일일 학습목표',
      suffix: ''
    },
    {
      value: goals.weeklyAttendance,
      label: '주간 목표 출석일',
      suffix: ''
    },
    {
      value: goals.weeklyTotalQuiz,
      label: '주간 목표 문제수',
      suffix: ''
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-5 mb-4 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-text-primary">나의 학습 목표</h2>
        <Button
          variant="secondary"
          size="sm"
          className="px-3 py-1.5 bg-accent-mint text-primary rounded-full text-xs font-semibold"
          onClick={onEditClick}
        >
          수정
        </Button>
      </div>
      <div className="flex justify-between items-center">
        {goalItems.map((item, index) => (
          <React.Fragment key={index}>
            <div className="text-center">
              <span className="block text-3xl font-bold text-primary mb-1">
                {item.value}{item.suffix}
              </span>
              <span className="text-xs text-text-secondary">{item.label}</span>
            </div>
            {index < goalItems.length - 1 && (
              <div className="w-px h-10 bg-gray-border"></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default GoalsSection;