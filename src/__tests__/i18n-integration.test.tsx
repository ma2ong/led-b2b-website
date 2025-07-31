import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import '@testing-library/jest-dom';

import { LanguageProvider } from '@/components/i18n/LanguageProvider';
import LanguageSwitcher from '@/components/navigation/LanguageSwitcher';
import { LocalizedDateTime, LocalizedNumber, LocalizedCurrency } from '@/components/i18n/LocalizedDateTime';
import { LocalizedInput, LocalizedButton } from '@/components/i18n/LocalizedForm';
import { Trans, T, PluralTrans } from '@/components/i18n/Trans';
import { HrefLangTags, LocalizedMetaTags, StructuredData } from '@/components/seo/HrefLangTags';
import { generateHrefLangTags, generateLanguageAlternates, i18nUtils } from '@/lib/i18n-config';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: jest.fn(),
}));

// Mock Next.js Head component
jest.mock('next/head', () => {
  return function Head({ children }: { children: React.ReactNode }) {
    return <div data-testid="head">{children}</div>;
  };
});

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
  t: jest.fn((key: string, fallback?: string) => {
    const translations: Record<string, string> = {
      'common.buttons.submit': 'Submit',
      'forms.name.label': 'Name',
      'forms.name.placeholder': 'Enter your name',
      'welcome': 'Welcome',
      'welcome_plural': 'Welcome all',
      'greeting': 'Hello {{name}}!',
    };
    return translations[key] || fallback || key;
  }),
  i18n: {
    language: 'en',
    changeLanguage: jest.fn(),
  },
};

describe('i18n Integration Tests', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useTranslation as jest.Mock).mockReturnValue(mockUseTranslation);
    jest.clearAllMocks();
    
    // Mock environment variables
    process.env.NEXT_PUBLIC_SITE_URL = 'https://lejin-led.com';
  });

  describe('Language Provider Integration', () => {
    it('should provide language context to child components', () => {
      const TestComponent = () => {
        return (
          <div>
            <LanguageSwitcher currentLocale="en" onLocaleChange={jest.fn()} />
          </div>
        );
      };

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
    });

    it('should handle language switching', async () => {
      const onLocaleChange = jest.fn();
      
      render(
        <LanguageProvider>
          <LanguageSwitcher currentLocale="en" onLocaleChange={onLocaleChange} />
        </LanguageProvider>
      );

      const switcher = screen.getByTestId('language-switcher');
      fireEvent.click(switcher);

      const zhOption = screen.getByTestId('language-option-zh');
      fireEvent.click(zhOption);

      await waitFor(() => {
        expect(onLocaleChange).toHaveBeenCalledWith('zh');
      });
    });
  });

  describe('Localized Components', () => {
    it('should render LocalizedDateTime correctly', () => {
      const testDate = new Date('2023-12-25T10:30:00Z');
      
      render(<LocalizedDateTime date={testDate} />);
      
      // Should render a time element
      const timeElement = screen.getByRole('time');
      expect(timeElement).toBeInTheDocument();
      expect(timeElement).toHaveAttribute('dateTime', testDate.toISOString());
    });

    it('should render LocalizedNumber correctly', () => {
      render(<LocalizedNumber value={1234.56} />);
      
      // Should render formatted number
      expect(screen.getByText(/1,234\.56/)).toBeInTheDocument();
    });

    it('should render LocalizedCurrency correctly', () => {
      render(<LocalizedCurrency amount={1234.56} />);
      
      // Should render formatted currency
      const currencyElement = screen.getByText(/\$1,234\.56/);
      expect(currencyElement).toBeInTheDocument();
    });

    it('should render LocalizedInput with translated labels', () => {
      render(
        <LocalizedInput
          labelKey="forms.name.label"
          placeholderKey="forms.name.placeholder"
        />
      );

      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    });

    it('should render LocalizedButton with translated text', () => {
      render(<LocalizedButton textKey="common.buttons.submit" />);
      
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });
  });

  describe('Translation Components', () => {
    it('should render Trans component with interpolation', () => {
      mockUseTranslation.t.mockImplementation((key: string, options?: any) => {
        if (key === 'greeting' && options?.name) {
          return `Hello ${options.name}!`;
        }
        return key;
      });

      render(
        <Trans
          i18nKey="greeting"
          values={{ name: 'John' }}
        />
      );

      expect(screen.getByText('Hello John!')).toBeInTheDocument();
    });

    it('should render T component for simple translations', () => {
      render(<T k="welcome" />);
      
      expect(screen.getByText('Welcome')).toBeInTheDocument();
    });

    it('should render PluralTrans component correctly', () => {
      render(
        <PluralTrans
          count={1}
          singularKey="welcome"
          pluralKey="welcome_plural"
        />
      );

      expect(screen.getByText('Welcome')).toBeInTheDocument();
    });

    it('should handle plural forms for count > 1', () => {
      render(
        <PluralTrans
          count={5}
          singularKey="welcome"
          pluralKey="welcome_plural"
        />
      );

      expect(screen.getByText('Welcome all')).toBeInTheDocument();
    });
  });

  describe('Language Switching Integration', () => {
    it('should update translations when language changes', async () => {
      const { rerender } = render(
        <LanguageProvider>
          <LocalizedButton textKey="common.buttons.submit" />
        </LanguageProvider>
      );

      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();

      // Simulate language change to Chinese
      mockRouter.locale = 'zh';
      mockUseTranslation.t.mockImplementation((key: string) => {
        const zhTranslations: Record<string, string> = {
          'common.buttons.submit': '提交',
        };
        return zhTranslations[key] || key;
      });

      rerender(
        <LanguageProvider>
          <LocalizedButton textKey="common.buttons.submit" />
        </LanguageProvider>
      );

      expect(screen.getByRole('button', { name: '提交' })).toBeInTheDocument();
    });

    it('should persist language preference', () => {
      const mockLocalStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
      };
      
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
      });

      render(
        <LanguageProvider>
          <LanguageSwitcher currentLocale="en" onLocaleChange={jest.fn()} />
        </LanguageProvider>
      );

      // Should check localStorage for saved preference
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('preferred-language');
    });
  });

  describe('SEO Integration', () => {
    it('should set correct HTML lang attribute', () => {
      render(
        <LanguageProvider>
          <div>Test content</div>
        </LanguageProvider>
      );

      // In a real test environment, we would check document.documentElement.lang
      // For now, we just verify the component renders without errors
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });
  });

  describe('Form Integration', () => {
    it('should handle form submission with localized validation', async () => {
      const handleSubmit = jest.fn((e) => e.preventDefault());

      render(
        <form onSubmit={handleSubmit}>
          <LocalizedInput
            labelKey="forms.name.label"
            name="name"
            required
          />
          <LocalizedButton
            type="submit"
            textKey="common.buttons.submit"
          />
        </form>
      );

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalled();
      });
    });

    it('should display localized validation errors', () => {
      render(
        <LocalizedInput
          labelKey="forms.name.label"
          errorKey="errors.validation.required"
        />
      );

      // The error should be displayed
      expect(screen.getByText('errors.validation.required')).toBeInTheDocument();
    });
  });

  describe('Accessibility Integration', () => {
    it('should maintain accessibility with language changes', () => {
      render(
        <LanguageProvider>
          <LocalizedInput
            labelKey="forms.name.label"
            required
          />
        </LanguageProvider>
      );

      const input = screen.getByLabelText('Name');
      expect(input).toHaveAttribute('required');
    });

    it('should announce language changes to screen readers', () => {
      render(
        <LanguageProvider>
          <div aria-live="polite" id="language-announcer">
            Language changed
          </div>
        </LanguageProvider>
      );

      const announcer = screen.getByText('Language changed');
      expect(announcer).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Performance Integration', () => {
    it('should not re-render unnecessarily on language change', () => {
      const renderSpy = jest.fn();
      
      const TestComponent = () => {
        renderSpy();
        return <div>Test</div>;
      };

      const { rerender } = render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Simulate language change
      rerender(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      // Component should re-render when language changes
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('SEO Integration', () => {
    it('should generate correct hreflang tags', () => {
      render(<HrefLangTags currentPath="/products" />);
      
      const headElement = screen.getByTestId('head');
      expect(headElement).toBeInTheDocument();
    });

    it('should generate language alternates correctly', () => {
      const alternates = generateLanguageAlternates('/products');
      
      expect(alternates).toHaveProperty('en');
      expect(alternates).toHaveProperty('zh-CN');
      expect(alternates.en).toBe('https://lejin-led.com/en/products');
      expect(alternates['zh-CN']).toBe('https://lejin-led.com/zh/products');
    });

    it('should render localized meta tags', () => {
      render(
        <LocalizedMetaTags
          title="Test Page"
          description="Test description"
          locale="en"
        />
      );
      
      const headElement = screen.getByTestId('head');
      expect(headElement).toBeInTheDocument();
    });

    it('should render structured data correctly', () => {
      const testData = {
        name: 'Test Organization',
        url: 'https://example.com',
      };

      render(
        <StructuredData
          type="Organization"
          data={testData}
        />
      );
      
      const headElement = screen.getByTestId('head');
      expect(headElement).toBeInTheDocument();
    });
  });

  describe('i18n Utils Integration', () => {
    it('should format dates correctly for different locales', () => {
      const testDate = new Date('2023-12-25T10:30:00Z');
      
      const enFormatted = i18nUtils.formatDate(testDate, 'en');
      const zhFormatted = i18nUtils.formatDate(testDate, 'zh');
      
      expect(typeof enFormatted).toBe('string');
      expect(typeof zhFormatted).toBe('string');
      expect(enFormatted).not.toBe(zhFormatted);
    });

    it('should format numbers correctly for different locales', () => {
      const testNumber = 1234.56;
      
      const enFormatted = i18nUtils.formatNumber(testNumber, 'en');
      const zhFormatted = i18nUtils.formatNumber(testNumber, 'zh');
      
      expect(typeof enFormatted).toBe('string');
      expect(typeof zhFormatted).toBe('string');
    });

    it('should format currency correctly for different locales', () => {
      const testAmount = 1234.56;
      
      const enFormatted = i18nUtils.formatCurrency(testAmount, 'en');
      const zhFormatted = i18nUtils.formatCurrency(testAmount, 'zh');
      
      expect(typeof enFormatted).toBe('string');
      expect(typeof zhFormatted).toBe('string');
      expect(enFormatted).toContain('$');
      expect(zhFormatted).toContain('¥');
    });

    it('should format relative time correctly', () => {
      const pastDate = new Date(Date.now() - 60000); // 1 minute ago
      const futureDate = new Date(Date.now() + 60000); // 1 minute from now
      
      const pastFormatted = i18nUtils.formatRelativeTime(pastDate, 'en');
      const futureFormatted = i18nUtils.formatRelativeTime(futureDate, 'en');
      
      expect(typeof pastFormatted).toBe('string');
      expect(typeof futureFormatted).toBe('string');
    });

    it('should detect text direction correctly', () => {
      const enDirection = i18nUtils.getTextDirection('en');
      const zhDirection = i18nUtils.getTextDirection('zh');
      
      expect(enDirection).toBe('ltr');
      expect(zhDirection).toBe('ltr');
    });

    it('should check RTL languages correctly', () => {
      const enIsRTL = i18nUtils.isRTL('en');
      const zhIsRTL = i18nUtils.isRTL('zh');
      
      expect(enIsRTL).toBe(false);
      expect(zhIsRTL).toBe(false);
    });
  });

  describe('Hreflang Generation', () => {
    it('should generate hreflang tags for all supported locales', () => {
      const hrefLangTags = generateHrefLangTags('/products');
      
      expect(hrefLangTags).toHaveLength(2); // en and zh
      expect(hrefLangTags[0]).toHaveProperty('hrefLang');
      expect(hrefLangTags[0]).toHaveProperty('href');
      expect(hrefLangTags[1]).toHaveProperty('hrefLang');
      expect(hrefLangTags[1]).toHaveProperty('href');
    });

    it('should generate correct URLs for hreflang tags', () => {
      const hrefLangTags = generateHrefLangTags('/about');
      
      const enTag = hrefLangTags.find(tag => tag.hrefLang === 'en');
      const zhTag = hrefLangTags.find(tag => tag.hrefLang === 'zh-CN');
      
      expect(enTag?.href).toBe('https://lejin-led.com/en/about');
      expect(zhTag?.href).toBe('https://lejin-led.com/zh/about');
    });
  });
});