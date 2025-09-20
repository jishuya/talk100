import React from 'react';

const Card = ({
  children,
  variant = 'default',
  padding = 'medium',
  shadow = true,
  rounded = true,
  interactive = false,
  onClick,
  className = '',
  ...props
}) => {
  // 카드 변형
  const variants = {
    default: 'bg-white border border-gray-border',
    primary: 'bg-gradient-mint text-white',
    secondary: 'bg-accent-mint border border-primary-light',
    pale: 'bg-accent-pale border border-gray-border',
    quiz: 'bg-white border-t-4 border-t-primary',
    summary: 'bg-white',
    character: 'bg-white relative',
  };

  // 패딩 크기
  const paddings = {
    none: '',
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6',
  };

  const baseClasses = `
    ${variants[variant]}
    ${paddings[padding]}
    ${rounded ? 'rounded-primary' : ''}
    ${shadow ? 'shadow-primary' : ''}
    ${interactive ? 'touchable cursor-pointer hover:shadow-primary-lg transition-shadow' : ''}
    ${className}
  `;

  return (
    <div
      className={baseClasses}
      onClick={interactive ? onClick : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

// 특화된 카드 변형들
export const QuizCard = ({ icon, title, count, onClick, className = '' }) => (
  <Card
    variant="quiz"
    interactive
    onClick={onClick}
    className={`text-center animate-slide-up ${className}`}
  >
    <div className="quiz-card-icon w-12 h-12 mx-auto mb-2 text-3xl flex items-center justify-center">
      {icon}
    </div>
    <div className="quiz-card-title font-bold text-text-primary mb-1">
      {title}
    </div>
    <div className="quiz-card-count text-sm text-text-secondary">
      {count}
    </div>
  </Card>
);

export const SummaryCard = ({ label, value, unit, icon, color = 'primary' }) => (
  <Card variant="summary" className="text-center">
    {icon && (
      <div className="mb-2 text-2xl">{icon}</div>
    )}
    <div className={`text-2xl font-bold text-${color} mb-1`}>
      {value}
      {unit && <span className="text-base ml-1 opacity-75">{unit}</span>}
    </div>
    <div className="text-sm text-text-secondary">{label}</div>
  </Card>
);

export const CharacterCard = ({ avatar, name, level, progress, badges, onAvatarClick, children }) => (
  <Card variant="character" padding="large" className="text-center relative">
    {/* 우측 상단 뱃지들 */}
    {badges && (
      <div className="absolute top-3 right-3 flex gap-2">
        {badges.map((badge, index) => (
          <div
            key={index}
            className="flex items-center gap-1 px-2 py-1 bg-accent-pale border border-primary-light rounded-primary-sm"
          >
            <span className="text-sm">{badge.icon}</span>
            <span className="text-xs font-semibold text-primary">{badge.count}</span>
          </div>
        ))}
      </div>
    )}

    {/* 아바타 */}
    <div
      className="w-20 h-20 mx-auto mb-3 bg-accent-mint rounded-full flex items-center justify-center text-4xl touchable"
      onClick={onAvatarClick}
    >
      {avatar}
    </div>

    {/* 캐릭터 정보 */}
    <div className="mb-4">
      <div className="text-xl font-bold text-text-primary mb-1">{name}</div>
      <div className="text-sm text-text-secondary">{level}</div>
    </div>

    {/* 진행률 */}
    {progress && (
      <div className="mb-4">
        <div className="w-24 h-24 mx-auto relative">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="44"
              stroke="var(--accent-mint)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="48"
              cy="48"
              r="44"
              stroke="var(--primary-color)"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${progress * 2.76} 276`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-primary">{progress}%</span>
          </div>
        </div>
      </div>
    )}

    {children}
  </Card>
);

export const HistoryCard = ({ items }) => (
  <Card>
    {items.map((item, index) => (
      <div
        key={item.id || index}
        className={`flex items-center py-3 touchable ${
          index < items.length - 1 ? 'border-b border-gray-border' : ''
        }`}
        onClick={item.onClick}
      >
        <div className="w-10 h-10 bg-accent-pale rounded-full flex items-center justify-center text-xl mr-3">
          {item.icon}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-text-primary text-sm">{item.title}</div>
          <div className="text-xs text-text-secondary">{item.time}</div>
        </div>
        <div className="font-bold text-primary">{item.score}%</div>
      </div>
    ))}
  </Card>
);

export default Card;