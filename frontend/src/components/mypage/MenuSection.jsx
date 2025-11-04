import { ToggleSwitch } from '../ui/ToggleSwitch';
import { getIcon } from '../../utils/iconMap';

const MenuSection = ({
  title,
  items,
  onItemClick,
  onToggleChange,
  onSliderChange
}) => {
  const handleItemClick = (item) => {
    // slider 타입은 클릭 이벤트 무시
    if (item.type === 'slider') {
      return;
    }

    if (item.type === 'toggle') {
      onToggleChange?.(item.id, !item.value);
    } else {
      onItemClick?.(item);
    }
  };

  const handleSliderChange = (item, value) => {
    const numValue = parseFloat(value);
    onSliderChange?.(item.id, numValue);
  };

  return (
    <div className="bg-white rounded-2xl mb-4 overflow-hidden shadow-lg">
      <div className="px-4 py-4 text-sm font-semibold text-text-secondary bg-gray-light border-b border-gray-border">
        {title}
      </div>

      {items.map((item, index) => (
        <div
          key={item.id}
          className={`${
            index < items.length - 1 ? 'border-b border-gray-border' : ''
          }`}
        >
          <div
            className={`flex items-center justify-between p-4 ${
              item.type !== 'slider' ? 'cursor-pointer touchable hover:bg-accent-pale/50' : ''
            }`}
            onClick={() => handleItemClick(item)}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 flex items-center justify-center ${item.bgColor} rounded-full text-lg border border-gray-border`}>
                {getIcon(item.icon, { size: 'lg' })}
              </div>
              <div>
                <div className="text-[15px] text-text-primary mb-0.5">{item.title}</div>
                {item.description && (
                  <div className="text-xs text-text-secondary">{item.description}</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {item.type === 'toggle' ? (
                <ToggleSwitch
                  checked={item.value}
                  onChange={(checked) => onToggleChange?.(item.id, checked)}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : item.type === 'slider' ? (
                <span className="text-sm font-semibold text-primary">{item.displayValue}</span>
              ) : (
                <>
                  {item.count !== undefined && (
                    <span className="text-sm text-text-secondary">
                      {item.countLabel || `${item.count}개`}
                    </span>
                  )}
                  <span className="text-base text-text-secondary">›</span>
                </>
              )}
            </div>
          </div>

          {/* 슬라이더 UI */}
          {item.type === 'slider' && (
            <div className="px-4 pb-4">
              <div className="flex justify-between mb-2 px-1">
                {item.sliderLabels?.map((label, idx) => (
                  <span key={idx} className="text-xs text-text-secondary">{label}</span>
                ))}
              </div>
              <input
                type="range"
                className="slider w-full h-1.5 bg-gray-border rounded outline-none appearance-none cursor-pointer"
                min={item.min}
                max={item.max}
                step={item.step}
                value={item.value}
                onChange={(e) => handleSliderChange(item, e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MenuSection;