import React from 'react';
import { useTranslation } from 'next-i18next';
import { interpolate } from '@/lib/i18n';

interface TransProps {
  i18nKey: string;
  namespace?: string;
  values?: Record<string, string | number>;
  components?: Record<string, React.ReactElement>;
  fallback?: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * 高级翻译组件，支持插值和组件替换
 */
export const Trans: React.FC<TransProps> = ({
  i18nKey,
  namespace,
  values = {},
  components = {},
  fallback,
  className,
  as: Component = 'span',
}) => {
  const { t } = useTranslation(namespace);
  
  let translatedText = t(i18nKey, fallback || i18nKey);
  
  // 处理值插值
  if (Object.keys(values).length > 0) {
    translatedText = interpolate(translatedText, values);
  }
  
  // 处理组件替换
  if (Object.keys(components).length > 0) {
    let processedContent: React.ReactNode = translatedText;
    
    Object.entries(components).forEach(([key, component]) => {
      const regex = new RegExp(`<${key}>(.*?)</${key}>`, 'g');
      const parts = translatedText.split(regex);
      
      if (parts.length > 1) {
        processedContent = parts.map((part, index) => {
          if (index % 2 === 1) {
            return React.cloneElement(component, { key: index }, part);
          }
          return part;
        });
      }
    });
    
    return <Component className={className}>{processedContent}</Component>;
  }
  
  return <Component className={className}>{translatedText}</Component>;
};

/**
 * 简化的翻译组件，只处理文本插值
 */
export const T: React.FC<{
  k: string;
  ns?: string;
  values?: Record<string, string | number>;
  fallback?: string;
}> = ({ k, ns, values, fallback }) => {
  const { t } = useTranslation(ns);
  const text = t(k, fallback || k);
  
  if (values && Object.keys(values).length > 0) {
    return <>{interpolate(text, values)}</>;
  }
  
  return <>{text}</>;
};

/**
 * 条件翻译组件，根据条件显示不同的翻译
 */
export const ConditionalTrans: React.FC<{
  condition: boolean;
  trueKey: string;
  falseKey: string;
  namespace?: string;
  values?: Record<string, string | number>;
}> = ({ condition, trueKey, falseKey, namespace, values }) => {
  const key = condition ? trueKey : falseKey;
  return <Trans i18nKey={key} namespace={namespace} values={values} />;
};

/**
 * 复数翻译组件
 */
export const PluralTrans: React.FC<{
  count: number;
  singularKey: string;
  pluralKey?: string;
  namespace?: string;
  values?: Record<string, string | number>;
}> = ({ count, singularKey, pluralKey, namespace, values = {} }) => {
  const { t, i18n } = useTranslation(namespace);
  
  // 中文没有复数形式
  if (i18n.language === 'zh') {
    return <Trans i18nKey={singularKey} namespace={namespace} values={{ count, ...values }} />;
  }
  
  const key = count === 1 ? singularKey : (pluralKey || `${singularKey}_plural`);
  return <Trans i18nKey={key} namespace={namespace} values={{ count, ...values }} />;
};

/**
 * 日期翻译组件
 */
export const DateTrans: React.FC<{
  date: Date | string;
  format?: 'short' | 'medium' | 'long' | 'full';
  relative?: boolean;
}> = ({ date, format = 'medium', relative = false }) => {
  const { i18n } = useTranslation();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (relative) {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    const rtf = new Intl.RelativeTimeFormat(i18n.language, { numeric: 'auto' });
    
    if (diffInSeconds < 60) {
      return <>{rtf.format(-diffInSeconds, 'second')}</>;
    } else if (diffInSeconds < 3600) {
      return <>{rtf.format(-Math.floor(diffInSeconds / 60), 'minute')}</>;
    } else if (diffInSeconds < 86400) {
      return <>{rtf.format(-Math.floor(diffInSeconds / 3600), 'hour')}</>;
    } else {
      return <>{rtf.format(-Math.floor(diffInSeconds / 86400), 'day')}</>;
    }
  }
  
  const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
    short: { dateStyle: 'short' },
    medium: { dateStyle: 'medium' },
    long: { dateStyle: 'long' },
    full: { dateStyle: 'full' },
  };
  
  return <>{dateObj.toLocaleDateString(i18n.language, formatOptions[format])}</>;
};

/**
 * 数字翻译组件
 */
export const NumberTrans: React.FC<{
  value: number;
  style?: 'decimal' | 'currency' | 'percent';
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}> = ({ 
  value, 
  style = 'decimal', 
  currency = 'USD',
  minimumFractionDigits,
  maximumFractionDigits 
}) => {
  const { i18n } = useTranslation();
  
  const options: Intl.NumberFormatOptions = {
    style,
    minimumFractionDigits,
    maximumFractionDigits,
  };
  
  if (style === 'currency') {
    options.currency = currency;
  }
  
  return <>{value.toLocaleString(i18n.language, options)}</>;
};

/**
 * HTML翻译组件，支持HTML内容
 */
export const HTMLTrans: React.FC<{
  i18nKey: string;
  namespace?: string;
  values?: Record<string, string | number>;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}> = ({ i18nKey, namespace, values = {}, className, as: Component = 'div' }) => {
  const { t } = useTranslation(namespace);
  let html = t(i18nKey);
  
  if (Object.keys(values).length > 0) {
    html = interpolate(html, values);
  }
  
  return (
    <Component 
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default Trans;