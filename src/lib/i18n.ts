import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

// 支持的语言列表
export const SUPPORTED_LOCALES = ['en', 'zh'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

// 语言信息配置
export const LOCALE_INFO = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    dir: 'ltr' as const,
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h' as const,
    currency: 'USD',
    region: 'US',
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    dir: 'ltr' as const,
    dateFormat: 'yyyy年MM月dd日',
    timeFormat: '24h' as const,
    currency: 'CNY',
    region: 'CN',
  },
} as const;

// 获取当前语言信息
export function useLocaleInfo() {
  const { locale } = useRouter();
  const currentLocale = (locale || 'en') as SupportedLocale;
  return LOCALE_INFO[currentLocale];
}

// 检查是否为支持的语言
export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

// 获取默认语言
export function getDefaultLocale(): SupportedLocale {
  return 'en';
}

export const DEFAULT_LOCALE: SupportedLocale = 'en';

// 获取语言信息
export function getLocaleInfo(locale: SupportedLocale) {
  return LOCALE_INFO[locale];
}

// 检查是否为RTL语言
export function isRTL(locale: SupportedLocale): boolean {
  return LOCALE_INFO[locale].dir === 'rtl';
}

// 语言切换函数
export function switchLanguage(locale: SupportedLocale, router: any) {
  const { pathname, asPath, query } = router;
  return router.push({ pathname, query }, asPath, { locale });
}

// 语言切换工具
export function useLanguageSwitcher() {
  const router = useRouter();
  const { locale } = router;

  const switchLanguage = async (newLocale: SupportedLocale) => {
    if (!isSupportedLocale(newLocale)) {
      console.warn(`Unsupported locale: ${newLocale}`);
      return;
    }

    const { pathname, asPath, query } = router;
    await router.push({ pathname, query }, asPath, { locale: newLocale });
  };

  return {
    currentLocale: (locale || 'en') as SupportedLocale,
    switchLanguage,
    supportedLocales: SUPPORTED_LOCALES,
    localeInfo: LOCALE_INFO,
  };
}

// 翻译工具函数
export function useTypedTranslation(namespace?: string) {
  const { t, i18n } = useTranslation(namespace);
  
  return {
    t,
    i18n,
    locale: i18n.language as SupportedLocale,
    isRTL: LOCALE_INFO[i18n.language as SupportedLocale]?.dir === 'rtl',
  };
}

// 数字格式化
export function formatNumber(
  number: number,
  locale: SupportedLocale,
  options?: Intl.NumberFormatOptions
): string {
  const localeCode = locale === 'zh' ? 'zh-CN' : 'en-US';
  return new Intl.NumberFormat(localeCode, options).format(number);
}

// 货币格式化
export function formatCurrency(
  amount: number,
  currency: string,
  locale: SupportedLocale
): string {
  const localeCode = locale === 'zh' ? 'zh-CN' : 'en-US';
  
  return new Intl.NumberFormat(localeCode, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

// 日期格式化
export function formatDate(
  date: Date | string,
  locale: SupportedLocale,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const localeCode = locale === 'zh' ? 'zh-CN' : 'en-US';
  
  const defaultOptions: Intl.DateTimeFormatOptions = locale === 'zh' 
    ? { year: 'numeric', month: '2-digit', day: '2-digit' }
    : { year: 'numeric', month: '2-digit', day: '2-digit' };
  
  return dateObj.toLocaleDateString(localeCode, { ...defaultOptions, ...options });
}

// 相对时间格式化
export function formatRelativeTime(
  date: Date | string,
  locale: SupportedLocale
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  const localeCode = locale === 'zh' ? 'zh-CN' : 'en-US';
  const rtf = new Intl.RelativeTimeFormat(localeCode, { numeric: 'auto' });
  
  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  } else if (diffInSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  } else if (diffInSeconds < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
  }
}

// 复数形式处理
export function pluralize(
  count: number,
  singular: string,
  plural?: string,
  locale: SupportedLocale = 'en'
): string {
  if (locale === 'zh') {
    // 中文没有复数形式
    return singular;
  }
  
  const pluralForm = plural || `${singular}s`;
  return count === 1 ? singular : pluralForm;
}

// 获取语言方向
export function getTextDirection(locale: SupportedLocale): 'ltr' | 'rtl' {
  return LOCALE_INFO[locale].dir;
}

// URL本地化工具
export function getLocalizedPath(path: string, locale: SupportedLocale): string {
  if (locale === getDefaultLocale()) {
    return path;
  }
  return `/${locale}${path}`;
}

// 生成本地化URL
export function getLocalizedUrl(
  path: string,
  targetLocale: SupportedLocale,
  currentLocale: SupportedLocale
): string {
  // 移除当前语言前缀
  const pathWithoutLocale = path.startsWith(`/${currentLocale}`) 
    ? path.slice(`/${currentLocale}`.length) 
    : path;
  
  // 添加目标语言前缀
  return targetLocale === DEFAULT_LOCALE 
    ? pathWithoutLocale || '/'
    : `/${targetLocale}${pathWithoutLocale || '/'}`;
}

// 从本地化路径中提取语言
export function extractLocaleFromPath(path: string): {
  locale: SupportedLocale;
  pathname: string;
} {
  const segments = path.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  if (isSupportedLocale(firstSegment)) {
    return {
      locale: firstSegment,
      pathname: '/' + segments.slice(1).join('/'),
    };
  }
  
  return {
    locale: getDefaultLocale(),
    pathname: path,
  };
}

// 语言检测工具
export function detectBrowserLanguage(): SupportedLocale {
  if (typeof window === 'undefined') {
    return getDefaultLocale();
  }
  
  const browserLang = navigator.language.split('-')[0];
  return isSupportedLocale(browserLang) ? browserLang : getDefaultLocale();
}

// 翻译插值工具
export function interpolate(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return values[key]?.toString() || match;
  });
}

// 命名空间翻译工具
export function createNamespacedTranslation(namespace: string) {
  return function useNamespacedT() {
    const { t } = useTranslation(namespace);
    return t;
  };
}

// 常用翻译钩子
export const useCommonTranslation = () => useTranslation('common');
export const useNavigationTranslation = () => useTranslation('navigation');
export const useProductsTranslation = () => useTranslation('products');
export const useFormsTranslation = () => useTranslation('forms');
export const useAboutTranslation = () => useTranslation('about');

// 翻译状态管理
export interface TranslationState {
  isLoading: boolean;
  error: string | null;
  loadedNamespaces: string[];
}

// 动态加载翻译命名空间
export async function loadTranslationNamespace(
  namespace: string,
  locale: SupportedLocale
): Promise<void> {
  try {
    // 这里可以实现动态加载逻辑
    // 例如从API或CDN加载翻译文件
    console.log(`Loading namespace ${namespace} for locale ${locale}`);
  } catch (error) {
    console.error(`Failed to load namespace ${namespace}:`, error);
    throw error;
  }
}

// 翻译缓存管理
class TranslationCache {
  private cache = new Map<string, any>();
  
  get(key: string): any {
    return this.cache.get(key);
  }
  
  set(key: string, value: any): void {
    this.cache.set(key, value);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  has(key: string): boolean {
    return this.cache.has(key);
  }
}

export const translationCache = new TranslationCache();