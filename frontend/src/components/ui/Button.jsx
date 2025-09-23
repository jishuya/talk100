import React from 'react';
import { cn } from '../../utils/cn';

// Button variants 정의
const buttonVariants = {
  variant: {
    primary: 'btn-primary',
    secondary: 'bg-white text-primary border border-primary hover:bg-accent-pale',
    ghost: 'bg-transparent text-text-primary hover:bg-gray-light',
    icon: 'bg-transparent text-text-primary hover:bg-gray-light p-2',
  },
  size: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  },
  shape: {
    rounded: 'rounded-brand',
    pill: 'rounded-brand-full',
    square: 'rounded-none',
    circle: 'rounded-full aspect-square',
  }
};

const Button = React.forwardRef(({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  shape = 'pill',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-300 touchable focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = buttonVariants.variant[variant] || buttonVariants.variant.primary;
  const sizeClasses = variant === 'icon' ? 'p-2' : buttonVariants.size[size];
  const shapeClasses = buttonVariants.shape[shape];

  const buttonClasses = cn(
    baseClasses,
    variantClasses,
    sizeClasses,
    shapeClasses,
    className
  );

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
          로딩 중...
        </>
      );
    }

    if (icon && !children) {
      return icon;
    }

    if (icon && iconPosition === 'left') {
      return (
        <>
          <span className="mr-2">{icon}</span>
          {children}
        </>
      );
    }

    if (icon && iconPosition === 'right') {
      return (
        <>
          {children}
          <span className="ml-2">{icon}</span>
        </>
      );
    }

    return children;
  };

  return (
    <button
      ref={ref}
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {renderContent()}
    </button>
  );
});

Button.displayName = 'Button';

// 특수 버튼 컴포넌트들
export const IconButton = ({ icon, ...props }) => (
  <Button variant="icon" shape="circle" icon={icon} {...props} />
);

export const StartLearningButton = ({ children, ...props }) => (
  <button
    className="btn-start-learning"
    {...props}
  >
    {children}
  </button>
);

export const SaveButton = ({ children = '저장', ...props }) => (
  <Button
    variant="primary"
    size="sm"
    shape="pill"
    {...props}
  >
    {children}
  </Button>
);

export { Button };
export default Button;