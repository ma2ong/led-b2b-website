import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import FormField from './FormField';
import type { SelectProps } from '@/types/components';

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      fullWidth = false,
      required = false,
      className,
      ...props
    },
    ref
  ) => {
    const selectClasses = cn(
      'form-select',
      error && 'error',
      fullWidth && 'w-full',
      className
    );

    // 按组分组选项
    const groupedOptions = options.reduce((groups, option) => {
      const group = option.group || 'default';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(option);
      return groups;
    }, {} as Record<string, typeof options>);

    const hasGroups = Object.keys(groupedOptions).length > 1 || !groupedOptions.default;

    const renderOptions = () => {
      if (!hasGroups) {
        return groupedOptions.default?.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ));
      }

      return Object.entries(groupedOptions).map(([groupName, groupOptions]) => {
        if (groupName === 'default') {
          return groupOptions.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ));
        }

        return (
          <optgroup key={groupName} label={groupName}>
            {groupOptions.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </optgroup>
        );
      });
    };

    const select = (
      <select
        ref={ref}
        className={selectClasses}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {renderOptions()}
      </select>
    );

    if (label || error || helperText) {
      return (
        <FormField
          label={label}
          error={error}
          helperText={helperText}
          required={required}
          fullWidth={fullWidth}
        >
          {select}
        </FormField>
      );
    }

    return select;
  }
);

Select.displayName = 'Select';

export default Select;