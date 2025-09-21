import React from 'react';
import { cn } from '../../utils/cn';

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
    🏆 {count}
  </span>
);

// Star Badge 컴포넌트
export const StarBadge = ({ count, className = '', ...props }) => (
  <span className={cn('badge-star', className)} {...props}>
    ⭐ {typeof count === 'number' ? count.toLocaleString() : count}
  </span>
);

export default Badge;