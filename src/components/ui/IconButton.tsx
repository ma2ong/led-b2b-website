import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import LoadingSpinner from './LoadingSpinner';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon: React.ReactNode;
  'aria-label': string; // 必需的，用于可访问性
  tooltip?: string;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      variant = 'ghost',
      size = 'md',
      loading = false,
      disabled = false,
      icon,
      tooltip,
      className,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      ghost: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      outline: 'text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
      danger: 'text-red-600 hover:text-red-700 hover:bg-red-50 focus:ring-red-500',
    };

    const sizeClasses = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-14 h-14 text-xl',
    };

    const iconSizeClasses = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-7 h-7',
    };

    const buttonClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      (loading || disabled) && 'pointer-events-none',
      className
    );

    const iconClasses = cn(iconSizeClasses[size]);

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={buttonClasses}
        title={tooltip}
        {...props}
      >
        {loading ? (
          <LoadingSpinner 
            size={size === 'xs' ? 'xs' : size === 'sm' ? 'sm' : 'md'} 
            color={variant === 'ghost' || variant === 'outline' || variant === 'danger' ? 'primary' : 'white'} 
          />
        ) : (
          <span className={iconClasses}>{icon}</span>
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton;