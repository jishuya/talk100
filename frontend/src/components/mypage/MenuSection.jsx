import React from 'react';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { getIcon } from '../../utils/iconMap';

const MenuSection = ({
  title,
  items,
  onItemClick,
  onToggleChange
}) => {
  const handleItemClick = (item) => {
    if (item.type === 'toggle') {
      onToggleChange?.(item.id, !item.value);
    } else {
      onItemClick?.(item);
    }
  };

  return (
    <div className="bg-white rounded-2xl mb-4 overflow-hidden shadow-lg">
      <div className="px-4 py-4 text-sm font-semibold text-text-secondary bg-gray-light border-b border-gray-border">
        {title}
      </div>

      {items.map((item, index) => (
        <div
          key={item.id}
          className={`flex items-center justify-between p-4 cursor-pointer touchable hover:bg-accent-pale/50 ${
            index < items.length - 1 ? 'border-b border-gray-border' : ''
          }`}
          onClick={() => handleItemClick(item)}
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 flex items-center justify-center ${item.bgColor} rounded-full text-lg`}>
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
      ))}
    </div>
  );
};

export default MenuSection;