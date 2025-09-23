import React from 'react';
import { cn } from '../../utils/cn';
import { getIcon } from '../../utils/iconMap.jsx';

// Card variants 정의
const cardVariants = {
  variant: {
    default: 'bg-white shadow-soft',
    personal: 'bg-surface shadow-soft',
    elevated: 'bg-white shadow-medium',
    flat: 'bg-white border border-gray-border',
  },
  padding: {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
    xl: 'p-6',
  },
  rounded: {
    none: 'rounded-none',
    sm: 'rounded-brand-sm',
    md: 'rounded-brand',
    lg: 'rounded-lg',
  }
};

const Card = React.forwardRef(({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  rounded = 'md',
  clickable = false,
  onClick,
  ...props
}, ref) => {
  const baseClasses = 'relative overflow-hidden';
  const interactiveClasses = clickable ? 'cursor-pointer touchable transition-all duration-300 hover:shadow-medium' : '';

  const variantClasses = cardVariants.variant[variant];
  const paddingClasses = cardVariants.padding[padding];
  const roundedClasses = cardVariants.rounded[rounded];

  const cardClasses = cn(
    baseClasses,
    variantClasses,
    paddingClasses,
    roundedClasses,
    interactiveClasses,
    className
  );

  const Component = clickable ? 'button' : 'div';

  return (
    <Component
      ref={ref}
      className={cardClasses}
      onClick={clickable ? onClick : undefined}
      {...props}
    >
      {children}
    </Component>
  );
});

Card.displayName = 'Card';

// Quiz Card 컴포넌트
export const QuizCard = React.forwardRef(({
  icon,
  title,
  count,
  variant = 'default',
  onClick,
  className = '',
  ...props
}, ref) => {
  const isPersonal = variant === 'personal';

  return (
    <div
      ref={ref}
      className={cn(
        isPersonal ? 'quiz-card-personal' : 'quiz-card',
        'animate-slide-up',
        className
      )}
      onClick={onClick}
      {...props}
    >
      <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
        {typeof icon === 'string' ? getIcon(icon, { size: '3xl' }) : icon}
      </div>
      <div className="text-sm font-bold text-text-primary mb-1">
        {title}
      </div>
      <div className="text-xs text-text-secondary">
        {count}
      </div>
    </div>
  );
});

QuizCard.displayName = 'QuizCard';

// Character Card 컴포넌트
export const CharacterCard = ({
  children,
  className = '',
  ...props
}) => (
  <div
    className={cn('character-card animate-fade-in', className)}
    {...props}
  >
    {children}
  </div>
);

// History Card 컴포넌트
export const HistoryCard = ({
  children,
  className = '',
  ...props
}) => (
  <div
    className={cn('history-card', className)}
    {...props}
  >
    {children}
  </div>
);

export default Card;