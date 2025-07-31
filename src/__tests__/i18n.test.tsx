/**
 * 国际化系统测试
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { 
  SupportedLocale, 
  SUPPORTED_LOCALES, 
  DEFAULT_LOCALE,
  switchLanguage,
  formatCurrency,
  formatDate,
  formatNumber,
  isRTL,
  getLocaleInfo,
} from '@/lib/i18n';
import { 
  getSEOConfig,
  getRouteConfig,
  generateHrefLangTags,
  isValidLocale,
  getBrowserPreferredLanguage,
  getLocalizedUrl,
  i18nUtils,
} from '@/lib/i18n-config';
import LanguageSwitcher from '@/components/navigation/LanguageSwitcher';
import { LanguageProvider } from '@/components/i18n/LanguageProvider';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: jest.fn(),
}));

const mockRouter = {
  locale: 'en',
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  pathname: '/',
  asPath: '/',
  query: {},
  push: jest.fn(),
};

const mockUseTranslation = {
  t: jest.fn((key: string) => key),
  i18n: {
    language: 'en',
    changeLanguage: jest.fn(),
  },
};

describe('i18n System', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useTranslation as jest.Mock).mockReturnValue(mockUseTranslation);
    jest.clearAllMocks();
  });

  describe('Basic Configuration', () => {
    test('should have correct supported locales', () => {
      expect(SUPPORTED_LOCALES).toEqual(['en', 'zh']);
      expect(DEFAULT_LOCALE).toBe('en');
    });

    test('should validate locale correctly', () => {
      expect(isValidLocale('en')).toBe(true);
      expect(isValidLocale('zh')).toBe(true);
      expect(isValidLocale('fr')).toBe(false);
      expect(isValidLocale('')).toBe(false);
    });

    test('should get locale info correctly', () => {
      const enInfo = getLocaleInfo('en');
      expect(enInfo).toEqual({
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸',
        dir: 'ltr',
      });

      const zhInfo = getLocaleInfo('zh');
      expect(zhInfo).toEqual({
        name: 'Chinese',
        nativeName: '中文',
        flag: '🇨🇳',
        dir: 'ltr',
      });
    });
  });

  describe('SEO Configuration', () => {
    test('should get SEO config correctly', () => {
      const enConfig = getSEOConfig('en');
      expect(enConfig).toEqual({
        htmlLang: 'en',
        hrefLang: 'en',
        locale: 'en_US',
        direction: 'ltr',
        dateFormat: 'MM/dd/yyyy',
        timeFormat: '12h',
        currency: 'USD',
        numberFormat: 'en-US',
      });

      const zhConfig = getSEOConfig('zh');
      expect(zhConfig).toEqual({
        htmlLang: 'zh-CN',
        hrefLang: 'zh-CN',
        locale: 'zh_CN',
        direction: 'ltr',
        dateFormat: 'yyyy/MM/dd',
        timeFormat: '24h',
        currency: 'CNY',
        numberFormat: 'zh-CN',
      });
    });

    test('should generate hreflang tags correctly', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
      const tags = generateHrefLangTags('/products');
      
      expect(tags).toEqual([
        { hrefLang: 'en', href: 'https://example.com/en/products' },
        { hrefLang: 'zh-CN', href: 'https://example.com/zh/products' },
      ]);
    });
  });

  describe('URL Localization', () => {
    test('should generate localized URLs correctly', () => {
      expect(getLocalizedUrl('/products', 'zh', 'en')).toBe('/zh/products');
      expect(getLocalizedUrl('/en/products', 'zh', 'en')).toBe('/zh/products');
      expect(getLocalizedUrl('/zh/products', 'en', 'zh')).toBe('/products');
      expect(getLocalizedUrl('/', 'zh', 'en')).toBe('/zh/');
    });

    test('should get route config correctly', () => {
      const enRoutes = getRouteConfig('en');
      expect(enRoutes.home).toBe('/');
      expect(enRoutes.products).toBe('/products');

      const zhRoutes = getRouteConfig('zh');
      expect(zhRoutes.home).toBe('/');
      expect(zhRoutes.products).toBe('/products');
    });
  });

  describe('Formatting Functions', () => {
    test('should format currency correctly', () => {
      const enCurrency = formatCurrency(1234.56, 'USD', 'en');
      expect(enCurrency).toMatch(/\$1,234\.56/);

      const zhCurrency = formatCurrency(1234.56, 'CNY', 'zh');
      expect(zhCurrency).toMatch(/¥1,234\.56/);
    });

    test('should format numbers correctly', () => {
      const enNumber = formatNumber(1234.56, 'en');
      expect(enNumber).toBe('1,234.56');

      const zhNumber = formatNumber(1234.56, 'zh');
      expect(zhNumber).toBe('1,234.56');
    });

    test('should format dates correctly', () => {
      const date = new Date('2023-12-25');
      const enDate = formatDate(date, 'en');
      const zhDate = formatDate(date, 'zh');
      
      expect(enDate).toMatch(/12\/25\/2023/);
      expect(zhDate).toMatch(/2023\/12\/25/);
    });

    test('should detect RTL correctly', () => {
      expect(isRTL('en')).toBe(false);
      expect(isRTL('zh')).toBe(false);
    });
  });

  describe('i18nUtils', () => {
    test('should format currency with utils', () => {
      const formatted = i18nUtils.formatCurrency(1000, 'en');
      expect(formatted).toMatch(/\$1,000\.00/);
    });

    test('should format numbers with utils', () => {
      const formatted = i18nUtils.formatNumber(1234.56, 'en');
      expect(formatted).toBe('1,234.56');
    });

    test('should get text direction', () => {
      expect(i18nUtils.getTextDirection('en')).toBe('ltr');
      expect(i18nUtils.getTextDirection('zh')).toBe('ltr');
    });

    test('should check RTL', () => {
      expect(i18nUtils.isRTL('en')).toBe(false);
      expect(i18nUtils.isRTL('zh')).toBe(false);
    });
  });

  describe('Language Switching', () => {
    test('should switch language correctly', () => {
      const mockPush = jest.fn();
      const router = { ...mockRouter, push: mockPush };
      
      switchLanguage('zh', router);
      
      expect(mockPush).toHaveBeenCalledWith(
        { pathname: '/', query: {} },
        '/',
        { locale: 'zh' }
      );
    });
  });

  describe('Browser Language Detection', () => {
    test('should detect browser preferred language', () => {
      // Mock navigator.languages
      Object.defineProperty(window.navigator, 'languages', {
        writable: true,
        value: ['zh-CN', 'zh', 'en'],
      });

      const preferred = getBrowserPreferredLanguage();
      expect(preferred).toBe('zh');
    });

    test('should fallback to default locale', () => {
      Object.defineProperty(window.navigator, 'languages', {
        writable: true,
        value: ['fr-FR', 'de-DE'],
      });

      const preferred = getBrowserPreferredLanguage();
      expect(preferred).toBe('en');
    });
  });
});

describe('LanguageProvider', () => {
  test('should provide language context', () => {
    const TestComponent = () => {
      return <div>Test Component</div>;
    };

    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });
});

describe('LanguageSwitcher Component', () => {
  const defaultProps = {
    currentLocale: 'en' as SupportedLocale,
    onLocaleChange: jest.fn(),
  };

  test('should render language switcher', () => {
    render(<LanguageSwitcher {...defaultProps} />);
    
    const switcher = screen.getByTestId('language-switcher');
    expect(switcher).toBeInTheDocument();
  });

  test('should show dropdown when clicked', () => {
    render(<LanguageSwitcher {...defaultProps} />);
    
    const switcher = screen.getByTestId('language-switcher');
    fireEvent.click(switcher);
    
    expect(screen.getByTestId('language-option-zh')).toBeInTheDocument();
  });

  test('should call onLocaleChange when language is selected', async () => {
    const onLocaleChange = jest.fn();
    render(<LanguageSwitcher {...defaultProps} onLocaleChange={onLocaleChange} />);
    
    const switcher = screen.getByTestId('language-switcher');
    fireEvent.click(switcher);
    
    const zhOption = screen.getByTestId('language-option-zh');
    fireEvent.click(zhOption);
    
    await waitFor(() => {
      expect(onLocaleChange).toHaveBeenCalledWith('zh');
    });
  });

  test('should render compact variant', () => {
    render(<LanguageSwitcher {...defaultProps} variant="compact" />);
    
    const switcher = screen.getByTestId('language-switcher');
    expect(switcher).toHaveClass('gap-1');
  });

  test('should close dropdown when clicking outside', () => {
    render(<LanguageSwitcher {...defaultProps} />);
    
    const switcher = screen.getByTestId('language-switcher');
    fireEvent.click(switcher);
    
    expect(screen.getByTestId('language-option-zh')).toBeInTheDocument();
    
    fireEvent.mouseDown(document.body);
    
    expect(screen.queryByTestId('language-option-zh')).not.toBeInTheDocument();
  });
});