/**
 * 表单验证规则库
 */

export type ValidationRule = (value: any) => string | undefined;

// 基础验证规则
export const required = (message = 'This field is required'): ValidationRule => {
  return (value: any) => {
    if (value === null || value === undefined || value === '' || 
        (Array.isArray(value) && value.length === 0)) {
      return message;
    }
    return undefined;
  };
};

export const minLength = (min: number, message?: string): ValidationRule => {
  return (value: string) => {
    if (value && value.length < min) {
      return message || `Must be at least ${min} characters`;
    }
    return undefined;
  };
};

export const maxLength = (max: number, message?: string): ValidationRule => {
  return (value: string) => {
    if (value && value.length > max) {
      return message || `Must be no more than ${max} characters`;
    }
    return undefined;
  };
};

export const email = (message = 'Please enter a valid email address'): ValidationRule => {
  return (value: string) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return message;
    }
    return undefined;
  };
};

export const phone = (message = 'Please enter a valid phone number'): ValidationRule => {
  return (value: string) => {
    if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
      return message;
    }
    return undefined;
  };
};

export const url = (message = 'Please enter a valid URL'): ValidationRule => {
  return (value: string) => {
    if (value) {
      try {
        new URL(value);
      } catch {
        return message;
      }
    }
    return undefined;
  };
};

export const number = (message = 'Please enter a valid number'): ValidationRule => {
  return (value: any) => {
    if (value !== '' && value !== null && value !== undefined && isNaN(Number(value))) {
      return message;
    }
    return undefined;
  };
};

export const min = (minimum: number, message?: string): ValidationRule => {
  return (value: number) => {
    if (value !== null && value !== undefined && value < minimum) {
      return message || `Must be at least ${minimum}`;
    }
    return undefined;
  };
};

export const max = (maximum: number, message?: string): ValidationRule => {
  return (value: number) => {
    if (value !== null && value !== undefined && value > maximum) {
      return message || `Must be no more than ${maximum}`;
    }
    return undefined;
  };
};

export const pattern = (regex: RegExp, message = 'Invalid format'): ValidationRule => {
  return (value: string) => {
    if (value && !regex.test(value)) {
      return message;
    }
    return undefined;
  };
};

export const oneOf = (options: any[], message?: string): ValidationRule => {
  return (value: any) => {
    if (value && !options.includes(value)) {
      return message || `Must be one of: ${options.join(', ')}`;
    }
    return undefined;
  };
};

export const fileSize = (maxSize: number, message?: string): ValidationRule => {
  return (files: File[] | File) => {
    const fileArray = Array.isArray(files) ? files : [files];
    for (const file of fileArray) {
      if (file && file.size > maxSize) {
        return message || `File size must be less than ${formatFileSize(maxSize)}`;
      }
    }
    return undefined;
  };
};

export const fileType = (allowedTypes: string[], message?: string): ValidationRule => {
  return (files: File[] | File) => {
    const fileArray = Array.isArray(files) ? files : [files];
    for (const file of fileArray) {
      if (file && !allowedTypes.includes(file.type)) {
        return message || `File type must be one of: ${allowedTypes.join(', ')}`;
      }
    }
    return undefined;
  };
};

// 组合验证规则
export const combine = (...rules: ValidationRule[]): ValidationRule => {
  return (value: any) => {
    for (const rule of rules) {
      const error = rule(value);
      if (error) {
        return error;
      }
    }
    return undefined;
  };
};

// 条件验证
export const when = (
  condition: (values: Record<string, any>) => boolean,
  rule: ValidationRule
): ValidationRule => {
  return (value: any, values?: Record<string, any>) => {
    if (values && condition(values)) {
      return rule(value);
    }
    return undefined;
  };
};

// 工具函数
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// LED显示屏相关的特定验证规则
export const pixelPitch = (message = 'Please enter a valid pixel pitch (e.g., P1.25, P2.5)'): ValidationRule => {
  return (value: string) => {
    if (value && !/^P\d+(\.\d+)?$/.test(value)) {
      return message;
    }
    return undefined;
  };
};

export const brightness = (message = 'Please enter a valid brightness value (cd/m²)'): ValidationRule => {
  return (value: string) => {
    const num = parseFloat(value);
    if (value && (isNaN(num) || num <= 0 || num > 10000)) {
      return message;
    }
    return undefined;
  };
};

export const resolution = (message = 'Please enter a valid resolution (e.g., 1920x1080)'): ValidationRule => {
  return (value: string) => {
    if (value && !/^\d+x\d+$/.test(value)) {
      return message;
    }
    return undefined;
  };
};

export const ipRating = (message = 'Please enter a valid IP rating (e.g., IP65)'): ValidationRule => {
  return (value: string) => {
    if (value && !/^IP\d{2}$/.test(value)) {
      return message;
    }
    return undefined;
  };
};