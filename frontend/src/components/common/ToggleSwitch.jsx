import React from 'react';

const ToggleSwitch = ({
  checked = false,
  onChange,
  disabled = false,
  size = 'medium',
  label = null,
  className = '',
  ...props
}) => {
  // 토글 크기
  const sizes = {
    small: {
      container: 'w-10 h-6',
      thumb: 'w-4 h-4',
      translate: 'translate-x-4',
    },
    medium: {
      container: 'w-12 h-7',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
    },
    large: {
      container: 'w-14 h-8',
      thumb: 'w-6 h-6',
      translate: 'translate-x-6',
    },
  };

  const sizeConfig = sizes[size];

  const handleClick = () => {
    if (disabled) return;

    // 햅틱 피드백
    if (navigator.vibrate) {
      navigator.vibrate(5);
    }

    onChange?.(!checked);
  };

  const containerClasses = `
    relative inline-flex items-center justify-center cursor-pointer transition-all duration-300
    ${sizeConfig.container}
    ${checked ? 'bg-primary' : 'bg-gray-300'}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-primary'}
    rounded-full
    ${className}
  `;

  const thumbClasses = `
    absolute left-1 top-1/2 transform -translate-y-1/2 transition-transform duration-300
    ${sizeConfig.thumb}
    ${checked ? sizeConfig.translate : 'translate-x-0'}
    bg-white rounded-full shadow-md
  `;

  if (label) {
    return (
      <label className="flex items-center gap-3 cursor-pointer">
        <div className={containerClasses} onClick={handleClick}>
          <div className={thumbClasses} />
        </div>
        <span className="text-text-primary select-none">{label}</span>
        <input
          type="checkbox"
          checked={checked}
          onChange={() => {}} // onChange는 div 클릭으로 처리
          disabled={disabled}
          className="sr-only"
          {...props}
        />
      </label>
    );
  }

  return (
    <div className={containerClasses} onClick={handleClick}>
      <div className={thumbClasses} />
      <input
        type="checkbox"
        checked={checked}
        onChange={() => {}} // onChange는 div 클릭으로 처리
        disabled={disabled}
        className="sr-only"
        {...props}
      />
    </div>
  );
};

export default ToggleSwitch;