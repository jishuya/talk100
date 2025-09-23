import React from 'react';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { Button } from '../ui/Button';

const SettingsSection = ({
  title,
  items,
  onItemChange,
  onItemClick
}) => {
  const renderSettingItem = (item) => {
    const handleClick = () => {
      if (item.type === 'link' || item.type === 'button') {
        onItemClick?.(item);
      }
    };

    const handleToggleChange = (checked) => {
      onItemChange?.(item.id, checked);
    };

    const handleSliderChange = (value) => {
      onItemChange?.(item.id, parseFloat(value));
    };

    const handleButtonGroupChange = (value) => {
      onItemChange?.(item.id, value);
    };

    return (
      <div key={item.id} className={`p-4 ${item.borderBottom !== false ? 'border-b border-gray-border' : ''}`}>
        {/* 기본 정보 영역 */}
        <div className="flex justify-between items-center mb-1">
          <span className="text-[15px] text-text-primary">{item.title}</span>
          {item.type === 'display' && (
            <span className="text-sm text-text-secondary">{item.displayValue}</span>
          )}
          {item.type === 'toggle' && (
            <ToggleSwitch
              checked={item.value}
              onChange={handleToggleChange}
            />
          )}
          {(item.type === 'link' || item.type === 'button') && (
            <div className="flex items-center gap-2" onClick={handleClick}>
              {item.rightText && (
                <span className="text-sm text-text-secondary">{item.rightText}</span>
              )}
              <span className="text-base text-text-secondary cursor-pointer">›</span>
            </div>
          )}
        </div>

        {/* 설명 텍스트 */}
        {item.description && (
          <div className="text-xs text-text-secondary mt-1 leading-relaxed">
            {item.description}
          </div>
        )}

        {/* 버튼 그룹 */}
        {item.type === 'buttonGroup' && (
          <div className="flex gap-2 mt-3">
            {item.options.map((option) => (
              <Button
                key={option.value}
                variant={item.value === option.value ? 'primary' : 'secondary'}
                size="sm"
                className="flex-1 py-2 px-3 text-sm"
                onClick={() => handleButtonGroupChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        )}

        {/* 슬라이더 */}
        {item.type === 'slider' && (
          <div className="mt-3">
            <div className="flex justify-between mb-2">
              {item.sliderLabels.map((label, index) => (
                <span key={index} className="text-xs text-text-secondary">{label}</span>
              ))}
            </div>
            <input
              type="range"
              className="slider w-full h-1.5 bg-gray-border rounded outline-none"
              min={item.min}
              max={item.max}
              step={item.step}
              value={item.value}
              onChange={(e) => handleSliderChange(e.target.value)}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl mb-4 overflow-hidden shadow-lg">
      <div className="px-4 py-4 text-sm font-semibold text-text-secondary bg-gray-light border-b border-gray-border">
        {title}
      </div>
      {items.map(renderSettingItem)}
    </div>
  );
};

export default SettingsSection;