import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { 
  SupportedLocale, 
  LOCALE_INFO, 
  isSupportedLocale, 
  getDefaultLocale,
  detectBrowserLanguage 
} from '@/lib/i18n';

interface LanguageContextType {
  locale: SupportedLocale;
  localeInfo: typeof LOCALE_INFO[SupportedLocale];
  switchLanguage: (locale: SupportedLocale) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  supportedLocales: readonly SupportedLocale[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
  fallbackLocale?: SupportedLocale;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  fallbackLocale = 'en',
}) => {
  const router = useRouter();
  const { i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentLocale = (router.locale || fallbackLocale) as SupportedLocale;
  const localeInfo = LOCALE_INFO[currentLocale];

  const switchLanguage = async (newLocale: SupportedLocale) => {
    if (!isSupportedLocale(newLocale)) {
      setError(`Unsupported locale: ${newLocale}`);
      return;
    }

    if (newLocale === currentLocale) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { pathname, asPath, query } = router;
      await router.push({ pathname, query }, asPath, { locale: newLocale });
      
      // 更新HTML lang属性
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLocale;
        document.documentElement.dir = LOCALE_INFO[newLocale].dir;
      }
      
      // 保存用户语言偏好
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('preferred-language', newLocale);
      }
    } catch (err) {
      setError('Failed to switch language');
      console.error('Language switch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始化语言设置
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = currentLocale;
      document.documentElement.dir = localeInfo.dir;
    }
  }, [currentLocale, localeInfo.dir]);

  // 检测并应用用户偏好语言
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage && isSupportedLocale(savedLanguage) && savedLanguage !== currentLocale) {
      switchLanguage(savedLanguage);
      return;
    }

    // 如果没有保存的语言偏好，检测浏览器语言
    if (!savedLanguage) {
      const browserLanguage = detectBrowserLanguage();
      if (browserLanguage !== currentLocale) {
        switchLanguage(browserLanguage);
      }
    }
  }, []);

  const contextValue: LanguageContextType = {
    locale: currentLocale,
    localeInfo,
    switchLanguage,
    isLoading,
    error,
    supportedLocales: Object.keys(LOCALE_INFO) as SupportedLocale[],
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// 高阶组件：为组件提供语言上下文
export function withLanguage<P extends object>(
  Component: React.ComponentType<P>
) {
  const WrappedComponent = (props: P) => {
    const languageContext = useLanguage();
    return <Component {...props} language={languageContext} />;
  };

  WrappedComponent.displayName = `withLanguage(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// 语言切换按钮组件
export const LanguageSwitchButton: React.FC<{
  className?: string;
  showFlag?: boolean;
  showName?: boolean;
}> = ({ className, showFlag = true, showName = true }) => {
  const { locale, localeInfo, switchLanguage, supportedLocales, isLoading } = useLanguage();

  const handleLanguageChange = () => {
    const otherLocale = supportedLocales.find(l => l !== locale);
    if (otherLocale) {
      switchLanguage(otherLocale);
    }
  };

  return (
    <button
      onClick={handleLanguageChange}
      disabled={isLoading}
      className={className}
      aria-label={`Switch to ${locale === 'en' ? 'Chinese' : 'English'}`}
    >
      {showFlag && <span>{localeInfo.flag}</span>}
      {showName && <span>{localeInfo.nativeName}</span>}
      {isLoading && <span>...</span>}
    </button>
  );
};