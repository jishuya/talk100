import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon = null,
  onClick,
  className = '',
  ...props
}) => {
  // 버튼 스타일 변형
  const variants = {
    primary: 'bg-primary text-text-on-primary hover:bg-primary-dark',
    secondary: 'bg-white text-primary border border-primary hover:bg-accent-pale',
    danger: 'bg-error text-white hover:opacity-90',
    success: 'bg-success text-white hover:opacity-90',
    warning: 'bg-warning text-white hover:opacity-90',
    info: 'bg-info text-white hover:opacity-90',
    ghost: 'bg-transparent text-primary border border-primary hover:bg-accent-pale',
    outline: 'bg-transparent text-text-primary border border-gray-border hover:bg-gray-light',
  };

  // 버튼 크기
  const sizes = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-3 text-base',
    large: 'px-6 py-4 text-lg',
  };

  // 버튼 모양
  const shapes = {
    rounded: 'rounded-primary-sm',
    pill: 'rounded-primary-full',
    square: 'rounded-none',
  };

  const baseClasses = `
    relative inline-flex items-center justify-center
    font-semibold transition-all duration-200
    touchable disabled:opacity-50 disabled:cursor-not-allowed
    focus:ring-2 focus:ring-primary focus:ring-opacity-50
    ${fullWidth ? 'w-full' : ''}
    ${variants[variant]}
    ${sizes[size]}
    ${shapes.pill}
    ${className}
  `;

  const handleClick = (e) => {
    if (disabled || loading) return;

    // 햅틱 피드백 시뮬레이션
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    onClick?.(e);
  };

  return (
    <button
      className={baseClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className={`flex items-center gap-2 ${loading ? 'opacity-0' : ''}`}>
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </div>
    </button>
  );
};

// 특화된 버튼 변형들
export const PrimaryButton = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props) => <Button variant="secondary" {...props} />;
export const DangerButton = (props) => <Button variant="danger" {...props} />;
export const StartLearningButton = (props) => (
  <Button
    variant="primary"
    size="large"
    fullWidth
    icon="📚"
    className="shadow-primary-lg"
    {...props}
  />
);

export default Button;