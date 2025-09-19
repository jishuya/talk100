import React from 'react';

const ProgressBar = ({
  value = 0,
  max = 100,
  size = 'medium',
  variant = 'primary',
  showLabel = false,
  label = null,
  animated = true,
  className = '',
}) => {
  // 프로그레스 바 크기
  const sizes = {
    small: 'h-2',
    medium: 'h-3',
    large: 'h-4',
    xlarge: 'h-6',
  };

  // 프로그레스 바 색상
  const variants = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
    info: 'bg-info',
  };

  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const containerClasses = `
    relative w-full ${sizes[size]} bg-accent-mint rounded-full overflow-hidden
    ${className}
  `;

  const fillClasses = `
    h-full ${variants[variant]} rounded-full transition-all duration-500 ease-out
    ${animated ? '' : 'transition-none'}
  `;

  return (
    <div className="w-full">
      {/* 라벨 */}
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-text-primary">
            {label || `진행률`}
          </span>
          <span className="text-sm font-semibold text-primary">
            {Math.round(percentage)}%
          </span>
        </div>
      )}

      {/* 프로그레스 바 */}
      <div className={containerClasses}>
        <div
          className={fillClasses}
          style={{ width: `${percentage}%` }}
        />

        {/* 글로우 효과 (애니메이션) */}
        {animated && percentage > 0 && (
          <div
            className={`absolute top-0 h-full ${variants[variant]} rounded-full opacity-50 blur-sm`}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  );
};

// 원형 프로그레스 바 컴포넌트
export const CircularProgress = ({
  value = 0,
  max = 100,
  size = 120,
  strokeWidth = 8,
  variant = 'primary',
  showLabel = true,
  children,
  className = '',
}) => {
  const variants = {
    primary: '#55AD9B',
    success: '#55AD9B',
    warning: '#FAAD14',
    error: '#FF4D4F',
    info: '#29B6F6',
  };

  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* 배경 원 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--accent-mint)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* 진행률 원 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={variants[variant]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>

      {/* 중앙 텍스트 */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (showLabel && (
          <span className="text-xl font-bold text-primary">
            {Math.round(percentage)}%
          </span>
        ))}
      </div>
    </div>
  );
};

// 스텝 프로그레스 바 (퀴즈 진행용)
export const StepProgress = ({
  currentStep = 0,
  totalSteps = 1,
  variant = 'primary',
  showNumbers = false,
  className = '',
}) => {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className={`w-full ${className}`}>
      {showNumbers && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-text-secondary">진행</span>
          <span className="text-sm font-semibold text-primary">
            {currentStep}/{totalSteps}
          </span>
        </div>
      )}

      <ProgressBar
        value={percentage}
        max={100}
        variant={variant}
        size="medium"
        animated
      />
    </div>
  );
};

export default ProgressBar;