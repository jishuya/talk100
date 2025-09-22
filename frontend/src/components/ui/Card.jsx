import React from 'react';
import { cn } from '../../utils/cn';
import { getIcon } from '../../utils/iconMap.jsx';

// 아이콘별 색상 매핑
const getIconColor = (iconName) => {
  const colorMap = {
    'BiBulb': 'text-3xl text-amber-400',         // 전구 - 부드러운 앰버 (아이디어)
    'BiChat': 'text-3xl text-sky-400',           // 채팅 - 부드러운 스카이블루 (소통)
    'BiDetail': 'text-3xl text-violet-400',      // 상세 - 부드러운 바이올렛 (전문성)
    'MdOutlineStar': 'text-3xl text-orange-400', // 별 - 부드러운 오렌지 (틀린문제)
    'AiFillHeart': 'text-3xl text-rose-400',     // 하트 - 부드러운 로즈 (즐겨찾기)
    'IoTrophy': 'text-3xl text-yellow-600',      // 트로피 - 금색
    'IoStar': 'text-3xl text-yellow-400'         // 별 - 부드러운 노란색
  };
  return colorMap[iconName] || 'text-3xl text-gray-400';
};

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
        {typeof icon === 'string' ? getIcon(icon, getIconColor(icon)) : icon}
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