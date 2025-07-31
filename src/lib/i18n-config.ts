/**
 * 完善的国际化配置系统
 */
import { SupportedLocale, SUPPORTED_LOCALES, DEFAULT_LOCALE } from './i18n';

// 语言路由配置
export const LOCALE_ROUTES = {
  en: {
    home: '/',
    about: '/about',
    products: '/products',
    solutions: '/solutions',
    cases: '/cases',
    news: '/news',
    contact: '/contact',
  },
  zh: {
    home: '/',
    about: '/about',
    products: '/products',
    solutions: '/solutions',
    cases: '/cases',
    news: '/news',
    contact: '/contact',
  },
} as const;

// SEO相关的语言配置
export const SEO_CONFIG = {
  en: {
    htmlLang: 'en',
    hrefLang: 'en',
    locale: 'en_US',
    direction: 'ltr',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
    currency: 'USD',
    numberFormat: 'en-US',
  },
  zh: {
    htmlLang: 'zh-CN',
    hrefLang: 'zh-CN',
    locale: 'zh_CN',
    direction: 'ltr',
    dateFormat: 'yyyy/MM/dd',
    timeFormat: '24h',
    currency: 'CNY',
    numberFormat: 'zh-CN',
  },
} as const;

// 翻译命名空间配置
export const TRANSLATION_NAMESPACES = [
  'common',
  'navigation',
  'home',
  'about',
  'products',
  'solutions',
  'cases',
  'news',
  'support',
  'contact',
  'forms',
  'errors',
] as const;

export type TranslationNamespace = typeof TRANSLATION_NAMESPACES[number];

// 默认翻译命名空间
export const DEFAULT_NAMESPACE = 'common';

// 语言检测配置
export const LANGUAGE_DETECTION_CONFIG = {
  // 检测顺序：路径 -> Cookie -> Header -> 浏览器语言
  order: ['path', 'cookie', 'header', 'navigator'] as const,
  // 缓存设置
  caches: ['cookie', 'localStorage'] as const,
  // Cookie配置
  cookieName: 'NEXT_LOCALE',
  cookieOptions: {
    maxAge: 365 * 24 * 60 * 60, // 1年
    httpOnly: false,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  },
  // localStorage配置
  lookupLocalStorage: 'preferred-language',
  // 排除路径（不进行语言检测的路径）
  excludeFromDetection: ['/api', '/_next', '/favicon.ico'],
};

// 翻译加载配置
export const TRANSLATION_LOADING_CONFIG = {
  // 预加载策略
  preload: ['common', 'navigation'] as TranslationNamespace[],
  // 懒加载策略
  lazyLoad: true,
  // 缓存策略
  cache: true,
  // 回退策略
  fallbackLng: {
    'zh-CN': ['zh', 'en'],
    'zh-TW': ['zh', 'en'],
    'zh-HK': ['zh', 'en'],
    default: ['en'],
  },
  // 插值配置
  interpolation: {
    escapeValue: false, // React已经处理了XSS
    format: (value: any, format: string, lng: string) => {
      if (format === 'uppercase') return value.toUpperCase();
      if (format === 'lowercase') return value.toLowerCase();
      if (format === 'currency') {
        const config = SEO_CONFIG[lng as SupportedLocale];
        return new Intl.NumberFormat(config.numberFormat, {
          style: 'currency',
          currency: config.currency,
        }).format(value);
      }
      return value;
    },
  },
};

// 获取语言的SEO配置
export const getSEOConfig = (locale: SupportedLocale) => {
  return SEO_CONFIG[locale];
};

// 获取语言的路由配置
export const getRouteConfig = (locale: SupportedLocale) => {
  return LOCALE_ROUTES[locale];
};

// 生成hreflang标签
export const generateHrefLangTags = (currentPath: string) => {
  return SUPPORTED_LOCALES.map(locale => {
    const config = getSEOConfig(locale);
    return {
      hrefLang: config.hrefLang,
      href: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}${currentPath}`,
    };
  });
};

// 生成语言切换链接
export const generateLanguageAlternates = (currentPath: string) => {
  const alternates: Record<string, string> = {};
  
  SUPPORTED_LOCALES.forEach(locale => {
    const config = getSEOConfig(locale);
    alternates[config.hrefLang] = `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}${currentPath}`;
  });
  
  return alternates;
};

// 验证语言代码
export const isValidLocale = (locale: string): locale is SupportedLocale => {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
};

// 获取浏览器首选语言
export const getBrowserPreferredLanguage = (): SupportedLocale => {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  
  const browserLanguages = navigator.languages || [navigator.language];
  
  for (const lang of browserLanguages) {
    // 提取主要语言代码
    const primaryLang = lang.split('-')[0];
    if (isValidLocale(primaryLang)) {
      return primaryLang;
    }
  }
  
  return DEFAULT_LOCALE;
};

// 语言切换时的URL处理
export const getLocalizedUrl = (
  path: string,
  targetLocale: SupportedLocale,
  currentLocale: SupportedLocale
): string => {
  // 移除当前语言前缀
  const pathWithoutLocale = path.startsWith(`/${currentLocale}`) 
    ? path.slice(`/${currentLocale}`.length) 
    : path;
  
  // 添加目标语言前缀
  return targetLocale === DEFAULT_LOCALE 
    ? pathWithoutLocale || '/'
    : `/${targetLocale}${pathWithoutLocale || '/'}`;
};

// 翻译键值验证
export const validateTranslationKey = (key: string): boolean => {
  // 检查键格式：namespace.key 或 namespace.nested.key
  const keyPattern = /^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)*$/;
  return keyPattern.test(key);
};

// 翻译值验证
export const validateTranslationValue = (value: any): boolean => {
  // 允许字符串、数字、布尔值和对象
  return typeof value === 'string' || 
         typeof value === 'number' || 
         typeof value === 'boolean' || 
         (typeof value === 'object' && value !== null);
};

// 获取翻译文件路径
export const getTranslationFilePath = (
  locale: SupportedLocale,
  namespace: TranslationNamespace
): string => {
  return `/locales/${locale}/${namespace}.json`;
};

// 语言相关的工具函数
export const i18nUtils = {
  // 格式化日期
  formatDate: (date: Date, locale: SupportedLocale, options?: Intl.DateTimeFormatOptions) => {
    const config = getSEOConfig(locale);
    return new Intl.DateTimeFormat(config.numberFormat, options).format(date);
  },
  
  // 格式化数字
  formatNumber: (number: number, locale: SupportedLocale, options?: Intl.NumberFormatOptions) => {
    const config = getSEOConfig(locale);
    return new Intl.NumberFormat(config.numberFormat, options).format(number);
  },
  
  // 格式化货币
  formatCurrency: (amount: number, locale: SupportedLocale) => {
    const config = getSEOConfig(locale);
    return new Intl.NumberFormat(config.numberFormat, {
      style: 'currency',
      currency: config.currency,
    }).format(amount);
  },
  
  // 格式化相对时间
  formatRelativeTime: (date: Date, locale: SupportedLocale) => {
    const config = getSEOConfig(locale);
    const rtf = new Intl.RelativeTimeFormat(config.numberFormat, { numeric: 'auto' });
    const diffInSeconds = (date.getTime() - Date.now()) / 1000;
    
    if (Math.abs(diffInSeconds) < 60) {
      return rtf.format(Math.round(diffInSeconds), 'second');
    } else if (Math.abs(diffInSeconds) < 3600) {
      return rtf.format(Math.round(diffInSeconds / 60), 'minute');
    } else if (Math.abs(diffInSeconds) < 86400) {
      return rtf.format(Math.round(diffInSeconds / 3600), 'hour');
    } else {
      return rtf.format(Math.round(diffInSeconds / 86400), 'day');
    }
  },
  
  // 获取语言方向
  getTextDirection: (locale: SupportedLocale) => {
    return getSEOConfig(locale).direction;
  },
  
  // 检查是否为RTL语言
  isRTL: (locale: SupportedLocale) => {
    return getSEOConfig(locale).direction === 'rtl';
  },
};

export default {
  LOCALE_ROUTES,
  SEO_CONFIG,
  TRANSLATION_NAMESPACES,
  DEFAULT_NAMESPACE,
  LANGUAGE_DETECTION_CONFIG,
  TRANSLATION_LOADING_CONFIG,
  getSEOConfig,
  getRouteConfig,
  generateHrefLangTags,
  generateLanguageAlternates,
  isValidLocale,
  getBrowserPreferredLanguage,
  getLocalizedUrl,
  validateTranslationKey,
  validateTranslationValue,
  getTranslationFilePath,
  i18nUtils,
};