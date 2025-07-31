import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

// 表单上下文类型
interface FormContextType {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  setValue: (name: string, value: any) => void;
  setError: (name: string, error: string) => void;
  setTouched: (name: string, touched: boolean) => void;
  validateField: (name: string) => void;
  validateForm: () => boolean;
}

// 表单配置类型
interface FormProps {
  initialValues?: Record<string, any>;
  validationSchema?: Record<string, (value: any) => string | undefined>;
  onSubmit: (values: Record<string, any>) => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
}

// 表单字段组件属性
interface FormFieldWrapperProps {
  name: string;
  children: (props: {
    value: any;
    error?: string;
    touched: boolean;
    onChange: (value: any) => void;
    onBlur: () => void;
  }) => React.ReactNode;
}

const FormContext = createContext<FormContextType | null>(null);

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a Form component');
  }
  return context;
};

const Form: React.FC<FormProps> = ({
  initialValues = {},
  validationSchema = {},
  onSubmit,
  children,
  className,
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    // 清除错误
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const setError = useCallback((name: string, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const setTouchedField = useCallback((name: string, isTouched: boolean) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
  }, []);

  const validateField = useCallback((name: string) => {
    const validator = validationSchema[name];
    if (validator) {
      const error = validator(values[name]);
      if (error) {
        setError(name, error);
        return false;
      }
    }
    return true;
  }, [validationSchema, values, setError]);

  const validateForm = useCallback(() => {
    let isValid = true;
    const newErrors: Record<string, string> = {};

    Object.keys(validationSchema).forEach(name => {
      const validator = validationSchema[name];
      const error = validator(values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validationSchema, values]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (isSubmitting) return;

    setIsSubmitting(true);
    
    // 标记所有字段为已触摸
    const allTouched = Object.keys(validationSchema).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    // 验证表单
    if (validateForm()) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
    
    setIsSubmitting(false);
  };

  const contextValue: FormContextType = {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setError,
    setTouched: setTouchedField,
    validateField,
    validateForm,
  };

  return (
    <FormContext.Provider value={contextValue}>
      <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
        {children}
      </form>
    </FormContext.Provider>
  );
};

// 表单字段包装器组件
export const FormField: React.FC<FormFieldWrapperProps> = ({ name, children }) => {
  const { values, errors, touched, setValue, setTouched, validateField } = useFormContext();

  const handleChange = (value: any) => {
    setValue(name, value);
  };

  const handleBlur = () => {
    setTouched(name, true);
    validateField(name);
  };

  return (
    <>
      {children({
        value: values[name],
        error: touched[name] ? errors[name] : undefined,
        touched: touched[name] || false,
        onChange: handleChange,
        onBlur: handleBlur,
      })}
    </>
  );
};

export default Form;