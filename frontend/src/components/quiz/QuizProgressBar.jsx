import React from 'react';

export const QuizProgressBar = ({
  progress = { completed: 0, total: 20, percentage: 0 }
}) => {
  return (
    <div className="bg-white shadow-soft rounded-brand mx-4 mb-4 mt-4 p-4">
      {/* 프로그레스 바 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-accent-mint rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
            style={{ width: `${Math.min(progress.percentage || 0, 100)}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-primary min-w-[60px] text-right">
          {progress.completed || 0}/{progress.total || 20}
        </span>
      </div>
    </div>
  );
};