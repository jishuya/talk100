import { cn } from '../../utils/cn';

const ToggleSwitch = ({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const sizeClasses = {
    sm: {
      toggle: 'w-8 h-5',
      thumb: 'w-3 h-3',
      translate: 'translate-x-3',
    },
    md: {
      toggle: 'w-10 h-6',
      thumb: 'w-4 h-4',
      translate: 'translate-x-4',
    },
    lg: {
      toggle: 'w-12 h-7',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
    },
  };

  const { toggle, thumb, translate } = sizeClasses[size];

  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  return (
    <label className={cn('inline-flex items-center cursor-pointer', className)} {...props}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
        />
        <div className={cn(
          toggle,
          'bg-gray-light rounded-full transition-colors duration-200 ease-in-out',
          checked ? 'bg-primary' : 'bg-gray-light',
          disabled && 'opacity-50 cursor-not-allowed'
        )}>
          <div className={cn(
            thumb,
            'bg-white rounded-full shadow-lg transform transition-transform duration-200 ease-in-out',
            'absolute top-1 left-1',
            checked ? translate : 'translate-x-0'
          )} />
        </div>
      </div>
      {children && (
        <span className="ml-3 text-sm font-medium text-text-primary">
          {children}
        </span>
      )}
    </label>
  );
};

export { ToggleSwitch };
export default ToggleSwitch;