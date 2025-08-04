const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
    localeDetection: false,
    domains: [
      {
        domain: 'lejin-led.com',
        defaultLocale: 'en',
      },
      {
        domain: 'lejin-led.cn',
        defaultLocale: 'zh',
      },
    ],
  },
  
  // 回退语言配置
  fallbackLng: {
    'zh-CN': ['zh', 'en'],
    'zh-TW': ['zh', 'en'],
    'zh-HK': ['zh', 'en'],
    default: ['en'],
  },
  
  // 开发模式配置
  debug: process.env.NODE_ENV === 'development',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  
  // 命名空间配置
  ns: [
    'common',
    'navigation',
    'home',
    'products',
    'solutions',
    'cases',
    'about',
    'contact',
    'forms',
    'news',
    'support',
    'errors',
  ],
  defaultNS: 'common',
  
  // 插值配置
  interpolation: {
    escapeValue: false, // React已经处理了XSS
    format: function(value, format, lng) {
      if (format === 'uppercase') return value.toUpperCase();
      if (format === 'lowercase') return value.toLowerCase();
      if (format === 'currency') {
        const locale = lng === 'zh' ? 'zh-CN' : 'en-US';
        const currency = lng === 'zh' ? 'CNY' : 'USD';
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: currency,
        }).format(value);
      }
      if (format === 'number') {
        const locale = lng === 'zh' ? 'zh-CN' : 'en-US';
        return new Intl.NumberFormat(locale).format(value);
      }
      if (format === 'date') {
        const locale = lng === 'zh' ? 'zh-CN' : 'en-US';
        return new Intl.DateTimeFormat(locale).format(new Date(value));
      }
      return value;
    },
  },
  
  // 本地化路径
  localePath: path.resolve('./public/locales'),
  
  // 服务端配置
  serverLanguageDetection: true,
  
  // 客户端语言检测配置
  detection: {
    order: ['path', 'cookie', 'localStorage', 'header', 'querystring', 'subdomain'],
    caches: ['cookie', 'localStorage'],
    excludeCacheFor: ['cimode'], // 排除缓存的语言
    cookieMinutes: 60 * 24 * 30, // 30天
    cookieDomain: process.env.NODE_ENV === 'production' ? '.lejin-led.com' : 'localhost',
    cookieOptions: {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },
  
  // 预加载配置
  preload: ['en', 'zh'],
  
  // 清理代码配置
  cleanCode: true,
  
  // 资源加载配置
  load: 'languageOnly', // 只加载语言代码，不加载地区代码
  
  // 复数规则配置
  pluralSeparator: '_',
  contextSeparator: '_',
  
  // 键分隔符配置
  keySeparator: '.',
  nsSeparator: ':',
  
  // 返回对象配置
  returnObjects: true,
  returnEmptyString: false,
  returnNull: false,
  
  // 后处理器配置
  postProcess: ['interval', 'plural'],
  
  // 资源配置
  resources: undefined, // 使用文件系统加载
  
  // 同步配置
  initImmediate: false,
  
  // 更新缺失键配置
  updateMissing: process.env.NODE_ENV === 'development',
  saveMissing: process.env.NODE_ENV === 'development',
  saveMissingTo: 'fallback',
  
  // 解析配置
  parseMissingKeyHandler: (key, defaultValue) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Missing translation key: ${key}`);
    }
    return defaultValue || key;
  },
  
  // 自定义后端配置（如果需要从API加载翻译）
  backend: {
    loadPath: '/api/locales/{{lng}}/{{ns}}',
    addPath: '/api/locales/add/{{lng}}/{{ns}}',
    allowMultiLoading: false,
    crossDomain: false,
    withCredentials: false,
    requestOptions: {
      mode: 'cors',
      credentials: 'same-origin',
      cache: 'default',
    },
  },
  
  // React配置
  react: {
    bindI18n: 'languageChanged',
    bindI18nStore: '',
    transEmptyNodeValue: '',
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
    useSuspense: false,
  },
};