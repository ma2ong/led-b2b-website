import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import type { LanguageSwitcherProps } from '@/types/navigation';

const languages = {
  en: {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    nativeName: 'English',
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    flag: '🇨🇳',
    nativeName: '中文',
  },
} as const;

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLocale,
  onLocaleChange,
  className,
  variant = 'default',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { t } = useTranslation('common');

  const currentLanguage = languages[currentLocale];
  const otherLanguage = languages[currentLocale === 'en' ? 'zh' : 'en'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = async (locale: 'en' | 'zh') => {
    setIsOpen(false);
    onLocaleChange(locale);
    
    // 使用Next.js路由进行语言切换
    const { pathname, asPath, query } = router;
    await router.push({ pathname, query }, asPath, { locale });
  };

  if (variant === 'compact') {
    return (
      <div className={cn('relative', className)} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-primary-600 transition-colors"
          data-testid="language-switcher"
          aria-label={t('navigation.switchLanguage')}
        >
          <span className="text-base">{currentLanguage.flag}</span>
          <ChevronDownIcon className={cn('w-3 h-3 transition-transform', isOpen && 'rotate-180')} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1 py-1 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[120px] z-dropdown">
            <button
              onClick={() => handleLanguageChange(otherLanguage.code)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              data-testid={`language-option-${otherLanguage.code}`}
            >
              <span className="text-base">{otherLanguage.flag}</span>
              <span>{otherLanguage.nativeName}</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
        data-testid="language-switcher"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <GlobeAltIcon className="w-4 h-4" />
        <span className="hidden sm:inline">{currentLanguage.flag}</span>
        <span className="hidden md:inline">{currentLanguage.nativeName}</span>
        <ChevronDownIcon className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 py-2 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[160px] z-dropdown animate-fade-in">
          <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
            {t('navigation.selectLanguage')}
          </div>
          
          <button
            onClick={() => handleLanguageChange('en')}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors',
              currentLocale === 'en'
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-700 hover:bg-gray-50'
            )}
            data-testid="language-option-en"
          >
            <span className="text-base">{languages.en.flag}</span>
            <div className="flex flex-col items-start">
              <span className="font-medium">{languages.en.name}</span>
              <span className="text-xs text-gray-500">{languages.en.nativeName}</span>
            </div>
            {currentLocale === 'en' && (
              <div className="ml-auto w-2 h-2 bg-primary-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => handleLanguageChange('zh')}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors',
              currentLocale === 'zh'
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-700 hover:bg-gray-50'
            )}
            data-testid="language-option-zh"
          >
            <span className="text-base">{languages.zh.flag}</span>
            <div className="flex flex-col items-start">
              <span className="font-medium">{languages.zh.name}</span>
              <span className="text-xs text-gray-500">{languages.zh.nativeName}</span>
            </div>
            {currentLocale === 'zh' && (
              <div className="ml-auto w-2 h-2 bg-primary-600 rounded-full" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;