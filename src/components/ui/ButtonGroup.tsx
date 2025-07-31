import React from 'react';
import { cn } from '@/lib/utils';
import type { ButtonGroupProps } from '@/types/components';

const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  variant = 'horizontal',
  size = 'md',
  fullWidth = false,
  className,
}) => {
  const groupClasses = cn(
    'inline-flex',
    variant === 'horizontal' ? 'flex-row' : 'flex-col',
    fullWidth && 'w-full',
    className
  );

  // 为子按钮添加特殊样式
  const childrenWithProps = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      const isFirst = index === 0;
      const isLast = index === React.Children.count(children) - 1;
      const isMiddle = !isFirst && !isLast;

      let additionalClasses = '';
      
      if (variant === 'horizontal') {
        if (isFirst) {
          additionalClasses = 'rounded-r-none border-r-0';
        } else if (isLast) {
          additionalClasses = 'rounded-l-none';
        } else if (isMiddle) {
          additionalClasses = 'rounded-none border-r-0';
        }
      } else {
        if (isFirst) {
          additionalClasses = 'rounded-b-none border-b-0';
        } else if (isLast) {
          additionalClasses = 'rounded-t-none';
        } else if (isMiddle) {
          additionalClasses = 'rounded-none border-b-0';
        }
      }

      return React.cloneElement(child, {
        ...child.props,
        className: cn(child.props.className, additionalClasses),
        size: child.props.size || size,
      });
    }
    return child;
  });

  return (
    <div className={groupClasses} role="group">
      {childrenWithProps}
    </div>
  );
};

export default ButtonGroup;