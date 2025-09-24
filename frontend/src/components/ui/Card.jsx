import React from 'react';
import { cn } from '../../utils/cn';

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


export default Card;