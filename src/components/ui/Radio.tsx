import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import FormField from './FormField';
import type { RadioProps, RadioGroupProps } from '@/types/components';

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      error,
      helperText,
      className,
      ...props
    },
    ref
  ) => {
    const radioClasses = cn(
      'w-4 h-4 text-primary-600 bg-white border-gray-300 focus:ring-primary-500 focus:ring-2 transition-colors',
      error && 'border-error-500 focus:ring-error-500',
      className
    );

    const radio = (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="radio"
            className={radioClasses}
            {...props}
          />
        </div>
        {label && (
          <div className="ml-3 text-sm">
            <label htmlFor={props.id} className="font-medium text-gray-700 cursor-pointer">
              {label}
            </label>
          </div>
        )}
      </div>
    );

    if (error || helperText) {
      return (
        <FormField
          error={error}
          helperText={helperText}
        >
          {radio}
        </FormField>
      );
    }

    return radio;
  }
);

Radio.displayName = 'Radio';

// 单选框组组件
const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value,
  onChange,
  options,
  label,
  error,
  helperText,
  direction = 'vertical',
  required = false,
  className,
}) => {
  const handleChange = (optionValue: string) => {
    if (onChange) {
      onChange(optionValue);
    }
  };

  const groupClasses = cn(
    'space-y-3',
    direction === 'horizontal' && 'flex space-x-6 space-y-0',
    className
  );

  const radioGroup = (
    <div className={groupClasses} role="radiogroup" aria-labelledby={label ? `${name}-label` : undefined}>
      {options.map((option, index) => (
        <div key={option.value} className="relative">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id={`${name}-${index}`}
                name={name}
                type="radio"
                value={option.value}
                checked={value === option.value}
                onChange={() => handleChange(option.value)}
                disabled={option.disabled}
                className={cn(
                  'w-4 h-4 text-primary-600 bg-white border-gray-300 focus:ring-primary-500 focus:ring-2 transition-colors',
                  error && 'border-error-500 focus:ring-error-500'
                )}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor={`${name}-${index}`} className="font-medium text-gray-700 cursor-pointer">
                {option.label}
              </label>
              {option.description && (
                <p className="text-gray-500 text-xs mt-1">{option.description}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <FormField
      label={label}
      error={error}
      helperText={helperText}
      required={required}
    >
      {radioGroup}
    </FormField>
  );
};

export default Radio;
export { RadioGroup };