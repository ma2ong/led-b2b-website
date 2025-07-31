/**
 * Localization Utilities
 * 本地化工具函数集合
 */

// 支持的语言环境
export const SUPPORTED_LOCALES = ['en', 'zh'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

// 地区配置
export interface LocaleConfig {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  flag: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  numberFormat: {
    decimal: string;
    thousands: string;
  };
  rtl: boolean;
}

export const LOCALE_CONFIGS: Record<SupportedLocale, LocaleConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: 'h:mm a',
    currency: 'USD',
    numberFormat: {
      decimal: '.',
      thousands: ',',
    },
    rtl: false,
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    dateFormat: 'yyyy年MM月dd日',
    timeFormat: 'HH:mm',
    currency: 'CNY',
    numberFormat: {
      decimal: '.',
      thousands: ',',
    },
    rtl: false,
  },
};

/**
 * 获取当前语言环境配置
 */
export function getLocaleConfig(locale: string): LocaleConfig {
  return LOCALE_CONFIGS[locale as SupportedLocale] || LOCALE_CONFIGS.en;
}

/**
 * 格式化日期
 */
export function formatDate(
  date: Date | string | number,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = new Date(date);
  const localeConfig = getLocaleConfig(locale);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  const formatLocale = locale === 'zh' ? 'zh-CN' : 'en-US';
  
  try {
    return new Intl.DateTimeFormat(formatLocale, formatOptions).format(dateObj);
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateObj.toLocaleDateString();
  }
}

/**
 * 格式化时间
 */
export function formatTime(
  date: Date | string | number,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = new Date(date);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  const formatLocale = locale === 'zh' ? 'zh-CN' : 'en-US';
  
  try {
    return new Intl.DateTimeFormat(formatLocale, formatOptions).format(dateObj);
  } catch (error) {
    console.error('Time formatting error:', error);
    return dateObj.toLocaleTimeString();
  }
}

/**
 * 格式化相对时间（如：2小时前）
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale: string
): string {
  const dateObj = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  const formatLocale = locale === 'zh' ? 'zh-CN' : 'en-US';
  
  try {
    const rtf = new Intl.RelativeTimeFormat(formatLocale, { numeric: 'auto' });
    
    // 定义时间单位
    const units: Array<[string, number]> = [
      ['year', 365 * 24 * 60 * 60],
      ['month', 30 * 24 * 60 * 60],
      ['week', 7 * 24 * 60 * 60],
      ['day', 24 * 60 * 60],
      ['hour', 60 * 60],
      ['minute', 60],
      ['second', 1],
    ];
    
    for (const [unit, secondsInUnit] of units) {
      const value = Math.floor(diffInSeconds / secondsInUnit);
      if (value !== 0) {
        return rtf.format(-value, unit as Intl.RelativeTimeFormatUnit);
      }
    }
    
    return rtf.format(0, 'second');
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return formatDate(dateObj, locale);
  }
}

/**
 * 格式化数字
 */
export function formatNumber(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions
): string {
  const formatLocale = locale === 'zh' ? 'zh-CN' : 'en-US';
  
  try {
    return new Intl.NumberFormat(formatLocale, options).format(value);
  } catch (error) {
    console.error('Number formatting error:', error);
    return value.toString();
  }
}

/**
 * 格式化货币
 */
export function formatCurrency(
  amount: number,
  locale: string,
  currency?: string
): string {
  const localeConfig = getLocaleConfig(locale);
  const currencyCode = currency || localeConfig.currency;
  
  return formatNumber(amount, locale, {
    style: 'currency',
    currency: currencyCode,
  });
}

/**
 * 格式化百分比
 */
export function formatPercent(
  value: number,
  locale: string,
  minimumFractionDigits = 1
): string {
  return formatNumber(value / 100, locale, {
    style: 'percent',
    minimumFractionDigits,
  });
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number, locale: string): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  const formattedSize = formatNumber(size, locale, {
    maximumFractionDigits: unitIndex === 0 ? 0 : 1,
  });
  
  return `${formattedSize} ${units[unitIndex]}`;
}

/**
 * 获取语言方向（LTR/RTL）
 */
export function getTextDirection(locale: string): 'ltr' | 'rtl' {
  const localeConfig = getLocaleConfig(locale);
  return localeConfig.rtl ? 'rtl' : 'ltr';
}

/**
 * 检查是否为RTL语言
 */
export function isRTL(locale: string): boolean {
  return getTextDirection(locale) === 'rtl';
}

/**
 * 获取语言的原生名称
 */
export function getLanguageNativeName(locale: string): string {
  const localeConfig = getLocaleConfig(locale);
  return localeConfig.nativeName;
}

/**
 * 获取语言标志
 */
export function getLanguageFlag(locale: string): string {
  const localeConfig = getLocaleConfig(locale);
  return localeConfig.flag;
}

/**
 * 排序函数 - 根据语言环境排序字符串数组
 */
export function sortByLocale(
  items: string[],
  locale: string,
  options?: Intl.CollatorOptions
): string[] {
  const formatLocale = locale === 'zh' ? 'zh-CN' : 'en-US';
  const collator = new Intl.Collator(formatLocale, options);
  return [...items].sort(collator.compare);
}

/**
 * 排序对象数组 - 根据指定属性和语言环境排序
 */
export function sortObjectsByLocale<T>(
  items: T[],
  key: keyof T,
  locale: string,
  options?: Intl.CollatorOptions
): T[] {
  const formatLocale = locale === 'zh' ? 'zh-CN' : 'en-US';
  const collator = new Intl.Collator(formatLocale, options);
  
  return [...items].sort((a, b) => {
    const aValue = String(a[key]);
    const bValue = String(b[key]);
    return collator.compare(aValue, bValue);
  });
}

/**
 * 获取浏览器首选语言
 */
export function getBrowserLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'en';
  
  const browserLang = navigator.language.toLowerCase();
  
  // 检查是否直接匹配
  if (SUPPORTED_LOCALES.includes(browserLang as SupportedLocale)) {
    return browserLang as SupportedLocale;
  }
  
  // 检查语言代码（忽略地区）
  const langCode = browserLang.split('-')[0];
  if (SUPPORTED_LOCALES.includes(langCode as SupportedLocale)) {
    return langCode as SupportedLocale;
  }
  
  // 检查所有浏览器语言
  for (const lang of navigator.languages) {
    const normalizedLang = lang.toLowerCase();
    if (SUPPORTED_LOCALES.includes(normalizedLang as SupportedLocale)) {
      return normalizedLang as SupportedLocale;
    }
    
    const langCode = normalizedLang.split('-')[0];
    if (SUPPORTED_LOCALES.includes(langCode as SupportedLocale)) {
      return langCode as SupportedLocale;
    }
  }
  
  return 'en'; // 默认返回英语
}

/**
 * 验证语言环境代码
 */
export function isValidLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

/**
 * 获取语言环境的显示名称
 */
export function getLocaleDisplayName(locale: string, displayLocale?: string): string {
  const targetLocale = displayLocale || locale;
  const formatLocale = targetLocale === 'zh' ? 'zh-CN' : 'en-US';
  
  try {
    const displayNames = new Intl.DisplayNames([formatLocale], { type: 'language' });
    const langCode = locale === 'zh' ? 'zh-CN' : locale;
    return displayNames.of(langCode) || locale;
  } catch (error) {
    console.error('Display name error:', error);
    return getLocaleConfig(locale).name;
  }
}

/**
 * 格式化地址
 */
export function formatAddress(
  address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  },
  locale: string
): string {
  const { street, city, state, country, postalCode } = address;
  
  if (locale === 'zh') {
    // 中文地址格式：国家 省/州 城市 街道 邮编
    const parts = [country, state, city, street, postalCode].filter(Boolean);
    return parts.join(' ');
  } else {
    // 英文地址格式：街道, 城市, 州 邮编, 国家
    const parts = [];
    if (street) parts.push(street);
    if (city) parts.push(city);
    if (state && postalCode) {
      parts.push(`${state} ${postalCode}`);
    } else if (state) {
      parts.push(state);
    } else if (postalCode) {
      parts.push(postalCode);
    }
    if (country) parts.push(country);
    return parts.join(', ');
  }
}

/**
 * 格式化电话号码
 */
export function formatPhoneNumber(phone: string, locale: string): string {
  // 移除所有非数字字符
  const digits = phone.replace(/\D/g, '');
  
  if (locale === 'zh') {
    // 中国手机号格式：138 0000 0000
    if (digits.length === 11 && digits.startsWith('1')) {
      return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
    }
    // 中国固话格式：010-1234-5678
    if (digits.length >= 10) {
      const areaCode = digits.slice(0, 3);
      const prefix = digits.slice(3, 7);
      const suffix = digits.slice(7);
      return `${areaCode}-${prefix}-${suffix}`;
    }
  } else {
    // 美国电话号码格式：(123) 456-7890
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    // 国际格式：+1 (123) 456-7890
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
  }
  
  return phone; // 如果无法格式化，返回原始值
}

export default {
  formatDate,
  formatTime,
  formatRelativeTime,
  formatNumber,
  formatCurrency,
  formatPercent,
  formatFileSize,
  formatAddress,
  formatPhoneNumber,
  getTextDirection,
  isRTL,
  getLanguageNativeName,
  getLanguageFlag,
  sortByLocale,
  sortObjectsByLocale,
  getBrowserLocale,
  isValidLocale,
  getLocaleDisplayName,
  getLocaleConfig,
};