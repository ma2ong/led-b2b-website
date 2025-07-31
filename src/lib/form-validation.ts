/**
 * 表单验证工具库
 */

export type ValidationRule = (value: any) => string | undefined;

// 基础验证规则
export const validationRules = {
  // 必填验证
  required: (message = 'This field is required'): ValidationRule => 
    (value) => {
      if (value === null || value === undefined || value === '' || 
          (Array.isArray(value) && value.length === 0)) {
        return message;
      }
      return undefined;
    },

  // 最小长度验证
  minLength: (min: number, message?: string): ValidationRule =>
    (value) => {
      if (value && value.length < min) {
        return message || `Must be at least ${min} characters`;
      }
      return undefined;
    },

  // 最大长度验证
  maxLength: (max: number, message?: string): ValidationRule =>
    (value) => {
      if (value && value.length > max) {
        return message || `Must be no more than ${max} characters`;
      }
      return undefined;
    },

  // 邮箱验证
  email: (message = 'Please enter a valid email address'): ValidationRule =>
    (value) => {
      if (value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
        return message;
      }
      return undefined;
    },

  // 电话号码验证
  phone: (message = 'Please enter a valid phone number'): ValidationRule =>
    (value) => {
      if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
        return message;
      }
      return undefined;
    },

  // URL验证
  url: (message = 'Please enter a valid URL'): ValidationRule =>
    (value) => {
      if (value && !/^https?:\/\/.+\..+/.test(value)) {
        return message;
      }
      return undefined;
    },

  // 数字验证
  number: (message = 'Please enter a valid number'): ValidationRule =>
    (value) => {
      if (value && isNaN(Number(value))) {
        return message;
      }
      return undefined;
    },

  // 最小值验证
  min: (min: number, message?: string): ValidationRule =>
    (value) => {
      if (value && Number(value) < min) {
        return message || `Must be at least ${min}`;
      }
      return undefined;
    },

  // 最大值验证
  max: (max: number, message?: string): ValidationRule =>
    (value) => {
      if (value && Number(value) > max) {
        return message || `Must be no more than ${max}`;
      }
      return undefined;
    },

  // 正则表达式验证
  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule =>
    (value) => {
      if (value && !regex.test(value)) {
        return message;
      }
      return undefined;
    },

  // 密码强度验证
  password: (message = 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character'): ValidationRule =>
    (value) => {
      if (value && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value)) {
        return message;
      }
      return undefined;
    },

  // 确认密码验证
  confirmPassword: (passwordField: string, message = 'Passwords do not match'): ValidationRule =>
    (value, formValues) => {
      if (value && formValues && value !== formValues[passwordField]) {
        return message;
      }
      return undefined;
    },

  // 日期验证
  date: (message = 'Please enter a valid date'): ValidationRule =>
    (value) => {
      if (value && isNaN(Date.parse(value))) {
        return message;
      }
      return undefined;
    },

  // 未来日期验证
  futureDate: (message = 'Date must be in the future'): ValidationRule =>
    (value) => {
      if (value && new Date(value) <= new Date()) {
        return message;
      }
      return undefined;
    },

  // 过去日期验证
  pastDate: (message = 'Date must be in the past'): ValidationRule =>
    (value) => {
      if (value && new Date(value) >= new Date()) {
        return message;
      }
      return undefined;
    },

  // 文件大小验证
  fileSize: (maxSizeInMB: number, message?: string): ValidationRule =>
    (value) => {
      if (value && value instanceof File) {
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
        if (value.size > maxSizeInBytes) {
          return message || `File size must be less than ${maxSizeInMB}MB`;
        }
      }
      return undefined;
    },

  // 文件类型验证
  fileType: (allowedTypes: string[], message?: string): ValidationRule =>
    (value) => {
      if (value && value instanceof File) {
        const fileType = value.type;
        if (!allowedTypes.includes(fileType)) {
          return message || `File type must be one of: ${allowedTypes.join(', ')}`;
        }
      }
      return undefined;
    },
};

// 组合验证规则
export const combineValidators = (...validators: ValidationRule[]): ValidationRule =>
  (value, formValues) => {
    for (const validator of validators) {
      const error = validator(value, formValues);
      if (error) {
        return error;
      }
    }
    return undefined;
  };

// 条件验证
export const conditionalValidator = (
  condition: (formValues: any) => boolean,
  validator: ValidationRule
): ValidationRule =>
  (value, formValues) => {
    if (condition(formValues)) {
      return validator(value, formValues);
    }
    return undefined;
  };

// 异步验证接口
export interface AsyncValidator {
  (value: any, formValues?: any): Promise<string | undefined>;
}

// 防抖异步验证
export const debounceAsyncValidator = (
  validator: AsyncValidator,
  delay = 300
): AsyncValidator => {
  let timeoutId: NodeJS.Timeout;
  
  return (value, formValues) => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        const result = await validator(value, formValues);
        resolve(result);
      }, delay);
    });
  };
};

// 常用验证组合
export const commonValidations = {
  // 用户名验证
  username: combineValidators(
    validationRules.required(),
    validationRules.minLength(3),
    validationRules.maxLength(20),
    validationRules.pattern(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores')
  ),

  // 邮箱验证
  email: combineValidators(
    validationRules.required(),
    validationRules.email()
  ),

  // 密码验证
  password: combineValidators(
    validationRules.required(),
    validationRules.password()
  ),

  // 姓名验证
  name: combineValidators(
    validationRules.required(),
    validationRules.minLength(2),
    validationRules.maxLength(50),
    validationRules.pattern(/^[a-zA-Z\s\u4e00-\u9fa5]+$/, 'Name can only contain letters and spaces')
  ),

  // 公司名称验证
  companyName: combineValidators(
    validationRules.required(),
    validationRules.minLength(2),
    validationRules.maxLength(100)
  ),

  // 电话号码验证
  phone: combineValidators(
    validationRules.required(),
    validationRules.phone()
  ),

  // 网站URL验证
  website: combineValidators(
    validationRules.url()
  ),

  // 询盘消息验证
  inquiryMessage: combineValidators(
    validationRules.required(),
    validationRules.minLength(10),
    validationRules.maxLength(1000)
  ),

  // 产品数量验证
  quantity: combineValidators(
    validationRules.required(),
    validationRules.number(),
    validationRules.min(1)
  ),

  // 预算验证
  budget: combineValidators(
    validationRules.number(),
    validationRules.min(0)
  ),
};

// 表单验证状态类型
export interface ValidationState {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// 验证表单
export const validateForm = (
  values: Record<string, any>,
  validationSchema: Record<string, ValidationRule>,
  touchedFields?: Record<string, boolean>
): ValidationState => {
  const errors: Record<string, string> = {};
  let isValid = true;

  Object.keys(validationSchema).forEach(fieldName => {
    const validator = validationSchema[fieldName];
    const error = validator(values[fieldName], values);
    
    if (error) {
      errors[fieldName] = error;
      isValid = false;
    }
  });

  return {
    isValid,
    errors,
    touched: touchedFields || {},
  };
};

// 验证单个字段
export const validateField = (
  fieldName: string,
  value: any,
  validator: ValidationRule,
  formValues?: Record<string, any>
): string | undefined => {
  return validator(value, formValues);
};

// 表单验证Hook类型
export interface UseFormValidationOptions {
  initialValues?: Record<string, any>;
  validationSchema?: Record<string, ValidationRule>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

// 表单验证结果类型
export interface FormValidationResult {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  setValue: (name: string, value: any) => void;
  setError: (name: string, error: string) => void;
  setTouched: (name: string, touched: boolean) => void;
  validateField: (name: string) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  handleSubmit: (onSubmit: (values: Record<string, any>) => Promise<void> | void) => (event: React.FormEvent) => Promise<void>;
}

export default validationRules;