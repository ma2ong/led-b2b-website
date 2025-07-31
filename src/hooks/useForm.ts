/**
 * 表单管理Hook
 */
import { useState, useCallback, useRef } from 'react';
import { 
  ValidationRule, 
  validateForm, 
  validateField,
  UseFormValidationOptions,
  FormValidationResult 
} from '@/lib/form-validation';

export const useForm = ({
  initialValues = {},
  validationSchema = {},
  validateOnChange = true,
  validateOnBlur = true,
}: UseFormValidationOptions = {}): FormValidationResult => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 使用ref来避免闭包问题
  const valuesRef = useRef(values);
  valuesRef.current = values;

  // 设置字段值
  const setValue = useCallback((name: string, value: any) => {
    setValues(prev => {
      const newValues = { ...prev, [name]: value };
      valuesRef.current = newValues;
      return newValues;
    });

    // 如果启用了onChange验证，则验证字段
    if (validateOnChange && validationSchema[name]) {
      const error = validateField(name, value, validationSchema[name], valuesRef.current);
      setErrors(prev => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[name] = error;
        } else {
          delete newErrors[name];
        }
        return newErrors;
      });
    }
  }, [validateOnChange, validationSchema]);

  // 设置字段错误
  const setError = useCallback((name: string, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  // 设置字段触摸状态
  const setTouchedField = useCallback((name: string, isTouched: boolean) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
  }, []);

  // 验证单个字段
  const validateSingleField = useCallback((name: string) => {
    const validator = validationSchema[name];
    if (validator) {
      const error = validateField(name, valuesRef.current[name], validator, valuesRef.current);
      setErrors(prev => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[name] = error;
        } else {
          delete newErrors[name];
        }
        return newErrors;
      });
      return !error;
    }
    return true;
  }, [validationSchema]);

  // 验证整个表单
  const validateEntireForm = useCallback(() => {
    const validation = validateForm(valuesRef.current, validationSchema, touched);
    setErrors(validation.errors);
    return validation.isValid;
  }, [validationSchema, touched]);

  // 重置表单
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    valuesRef.current = initialValues;
  }, [initialValues]);

  // 处理表单提交
  const handleSubmit = useCallback((
    onSubmit: (values: Record<string, any>) => Promise<void> | void
  ) => {
    return async (event: React.FormEvent) => {
      event.preventDefault();
      
      if (isSubmitting) return;

      // 标记所有字段为已触摸
      const allTouched = Object.keys(validationSchema).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setTouched(allTouched);

      // 验证表单
      const validation = validateForm(valuesRef.current, validationSchema, allTouched);
      setErrors(validation.errors);

      if (validation.isValid) {
        setIsSubmitting(true);
        try {
          await onSubmit(valuesRef.current);
        } catch (error) {
          console.error('Form submission error:', error);
          // 可以在这里设置全局错误状态
        } finally {
          setIsSubmitting(false);
        }
      }
    };
  }, [isSubmitting, validationSchema]);

  // 字段处理器生成器
  const getFieldProps = useCallback((name: string) => {
    return {
      name,
      value: values[name] || '',
      error: touched[name] ? errors[name] : undefined,
      onChange: (value: any) => setValue(name, value),
      onBlur: () => {
        setTouchedField(name, true);
        if (validateOnBlur) {
          validateSingleField(name);
        }
      },
    };
  }, [values, errors, touched, setValue, setTouchedField, validateOnBlur, validateSingleField]);

  // 计算表单是否有效
  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    setValue,
    setError,
    setTouched: setTouchedField,
    validateField: validateSingleField,
    validateForm: validateEntireForm,
    resetForm,
    handleSubmit,
    getFieldProps,
  } as FormValidationResult & { getFieldProps: (name: string) => any };
};

// 表单字段Hook
export const useFormField = (
  name: string,
  form: FormValidationResult
) => {
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = event.target.type === 'checkbox' 
      ? (event.target as HTMLInputElement).checked
      : event.target.value;
    form.setValue(name, value);
  }, [name, form]);

  const handleBlur = useCallback(() => {
    form.setTouched(name, true);
    form.validateField(name);
  }, [name, form]);

  return {
    name,
    value: form.values[name] || '',
    error: form.touched[name] ? form.errors[name] : undefined,
    onChange: handleChange,
    onBlur: handleBlur,
  };
};

export default useForm;