import React from 'react';
import { cn } from '@/lib/utils';
import type { FormFieldProps } from '@/types/components';

const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helperText,
  required = false,
  fullWidth = false,
  children,
  className,
}) => {
  return (
    <div className={cn('space-y-1', fullWidth && 'w-full', className)}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      {children}
      
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      
      {helperText && !error && (
        <div className="form-help">
          {helperText}
        </div>
      )}
    </div>
  );
};

export default FormField;