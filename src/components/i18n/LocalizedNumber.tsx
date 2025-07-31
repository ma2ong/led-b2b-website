/**
 * Localized Number Component
 * 本地化数字格式化组件
 */
import { useRouter } from 'next/router';
import { useMemo } from 'react';

export interface LocalizedNumberProps {
  value: number;
  style?: 'decimal' | 'currency' | 'percent' | 'unit';
  currency?: string;
  unit?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  useGrouping?: boolean;
  className?: string;
}

export function LocalizedNumber({
  value,
  style = 'decimal',
  currency = 'USD',
  unit,
  minimumFractionDigits,
  maximumFractionDigits,
  useGrouping = true,
  className,
}: LocalizedNumberProps) {
  const router = useRouter();
  const locale = router.locale || 'en';
  
  const formattedValue = useMemo(() => {
    try {
      const options: Intl.NumberFormatOptions = {
        useGrouping,
      };
      
      if (minimumFractionDigits !== undefined) {
        options.minimumFractionDigits = minimumFractionDigits;
      }
      
      if (maximumFractionDigits !== undefined) {
        options.maximumFractionDigits = maximumFractionDigits;
      }
      
      switch (style) {
        case 'currency':
          options.style = 'currency';
          options.currency = currency;
          break;
          
        case 'percent':
          options.style = 'percent';
          break;
          
        case 'unit':
          if (unit) {
            options.style = 'unit';
            options.unit = unit;
          }
          break;
          
        default:
          options.style = 'decimal';
      }
      
      // 根据语言环境调整格式
      const formatLocale = locale === 'zh' ? 'zh-CN' : 'en-US';
      
      return new Intl.NumberFormat(formatLocale, options).format(value);
    } catch (error) {
      console.error('Error formatting number:', error);
      return value.toString();
    }
  }, [value, style, currency, unit, minimumFractionDigits, maximumFractionDigits, useGrouping, locale]);
  
  return <span className={className}>{formattedValue}</span>;
}

/**
 * 预设的数字格式化组件
 */

// 价格格式化
export function LocalizedPrice({ 
  value, 
  currency = 'USD', 
  className 
}: { 
  value: number; 
  currency?: string; 
  className?: string; 
}) {
  return (
    <LocalizedNumber
      value={value}
      style="currency"
      currency={currency}
      className={className}
    />
  );
}

// 百分比格式化
export function LocalizedPercent({ 
  value, 
  minimumFractionDigits = 1,
  className 
}: { 
  value: number; 
  minimumFractionDigits?: number;
  className?: string; 
}) {
  return (
    <LocalizedNumber
      value={value / 100} // 转换为小数
      style="percent"
      minimumFractionDigits={minimumFractionDigits}
      className={className}
    />
  );
}

// 文件大小格式化
export function LocalizedFileSize({ 
  bytes, 
  className 
}: { 
  bytes: number; 
  className?: string; 
}) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return (
    <span className={className}>
      <LocalizedNumber
        value={size}
        maximumFractionDigits={unitIndex === 0 ? 0 : 1}
      />
      {' '}
      {units[unitIndex]}
    </span>
  );
}

// 距离格式化
export function LocalizedDistance({ 
  meters, 
  className 
}: { 
  meters: number; 
  className?: string; 
}) {
  const router = useRouter();
  const locale = router.locale || 'en';
  
  // 根据地区选择单位
  const useMetric = locale === 'zh' || locale === 'en'; // 大部分地区使用公制
  
  if (useMetric) {
    if (meters < 1000) {
      return (
        <span className={className}>
          <LocalizedNumber value={meters} maximumFractionDigits={0} />
          {' m'}
        </span>
      );
    } else {
      return (
        <span className={className}>
          <LocalizedNumber value={meters / 1000} maximumFractionDigits={1} />
          {' km'}
        </span>
      );
    }
  } else {
    // 英制单位（英尺和英里）
    const feet = meters * 3.28084;
    if (feet < 5280) {
      return (
        <span className={className}>
          <LocalizedNumber value={feet} maximumFractionDigits={0} />
          {' ft'}
        </span>
      );
    } else {
      return (
        <span className={className}>
          <LocalizedNumber value={feet / 5280} maximumFractionDigits={1} />
          {' mi'}
        </span>
      );
    }
  }
}

// 重量格式化
export function LocalizedWeight({ 
  grams, 
  className 
}: { 
  grams: number; 
  className?: string; 
}) {
  const router = useRouter();
  const locale = router.locale || 'en';
  
  // 根据地区选择单位
  const useMetric = locale === 'zh' || locale === 'en';
  
  if (useMetric) {
    if (grams < 1000) {
      return (
        <span className={className}>
          <LocalizedNumber value={grams} maximumFractionDigits={0} />
          {' g'}
        </span>
      );
    } else {
      return (
        <span className={className}>
          <LocalizedNumber value={grams / 1000} maximumFractionDigits={1} />
          {' kg'}
        </span>
      );
    }
  } else {
    // 英制单位（盎司和磅）
    const ounces = grams * 0.035274;
    if (ounces < 16) {
      return (
        <span className={className}>
          <LocalizedNumber value={ounces} maximumFractionDigits={1} />
          {' oz'}
        </span>
      );
    } else {
      return (
        <span className={className}>
          <LocalizedNumber value={ounces / 16} maximumFractionDigits={1} />
          {' lb'}
        </span>
      );
    }
  }
}

export default LocalizedNumber;