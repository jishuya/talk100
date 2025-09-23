import React from 'react';
import { cn } from '../../utils/cn';
import { getIcon } from '../../utils/iconMap';

// Badge variants
const badgeVariants = {
  variant: {
    default: 'bg-accent-pale border border-primary-light text-primary',
    primary: 'bg-primary text-white',
    secondary: 'bg-gray-light text-text-secondary',
    success: 'bg-success text-white',
    warning: 'bg-warning text-white',
    error: 'bg-error text-white',
  },
  size: {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1 text-sm',
  }
};

/**
 forwardRef((props, ref) => {
    return <div ref={ref}>{props.children}</div>;
  }); 
  -> forwardRef는 함수 하나를 인자로 받으며 그 함수는 두 개의 매개변수를 가짐.
    1) props → 부모가 전달한 일반 props (예: className, onClick 등)
    2) ref → 부모가 <MyComponent ref={...} />로 넘긴 ref 객체
 */
const Badge = React.forwardRef(({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  icon,
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center rounded-xl font-medium';

  const variantClasses = badgeVariants.variant[variant];
  const sizeClasses = badgeVariants.size[size];

  const badgeClasses = cn(
    baseClasses,
    variantClasses,
    sizeClasses,
    className
  );

  return (
    <span ref={ref} className={badgeClasses} {...props}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

// Trophy Badge 컴포넌트
export const TrophyBadge = ({ count, className = '', ...props }) => (
  <span className={cn('badge-trophy', className)} {...props}>
    {getIcon('IoTrophy', { size: 'md', className: 'inline mr-1' })} {count}
  </span>
);

// Star Badge 컴포넌트
export const StarBadge = ({ count, className = '', ...props }) => (
  <span className={cn('badge-star', className)} {...props}>
    {getIcon('IoStar', { size: 'md', className: 'inline mr-1' })} {typeof count === 'number' ? count.toLocaleString() : count}
  </span>
);

export default Badge;