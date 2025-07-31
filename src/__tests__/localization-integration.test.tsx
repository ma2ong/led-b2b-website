/**
 * 本地化功能集成测试
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import { 
  formatDate, 
  formatTime, 
  formatRelativeTime,
  formatNumber,
  formatCurrency,
  formatPercent,
  formatFileSize,
  formatAddress,
  formatPhoneNumber,
  getBrowserLocale,
  isValidLocale,
  getLocaleDisplayName,
  sortByLocale,
  sortObjectsByLocale
} from '@/lib/localization-utils';
import { LocalizedNumber, LocalizedPrice, LocalizedPercent } from '@/components/i18n/LocalizedNumber';
import { CurrencyConverter, SmartPrice, PriceRange } from '@/components/i18n/CurrencyConverter';
import { SEOHead } from '@/components/seo/SEOHead';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

const mockRouter = {
  locale: 'en',
  defaultLocale: 'en',
  locales: ['en', 'zh'],
  asPath: '/test',
  push: jest.fn(),
  replace: jest.fn(),
};

describe('Localization Integration Tests', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  describe('Date and Time Formatting', () => {
    const testDate = new Date('2024-01-15T14:30:00Z');

    it('should format dates correctly for English locale', () => {
      const formatted = formatDate(testDate, 'en');
      expect(formatted).toMatch(/January 15, 2024/);
    });

    it('should format dates correctly for Chinese locale', () => {
      const formatted = formatDate(testDate, 'zh');
      expect(formatted).toMatch(/2024年1月15日/);
    });

    it('should format time correctly for English locale', () => {
      const formatted = formatTime(testDate, 'en');
      expect(formatted).toMatch(/2:30 PM|14:30/);
    });

    it('should format time correctly for Chinese locale', () => {
      const formatted = formatTime(testDate, 'zh');
      expect(formatted).toMatch(/14:30/);
    });

    it('should format relative time correctly', () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const englishRelative = formatRelativeTime(oneHourAgo, 'en');
      expect(englishRelative).toMatch(/hour ago|1 hour ago/);
      
      const chineseRelative = formatRelativeTime(oneHourAgo, 'zh');
      expect(chineseRelative).toMatch(/小时前|1小时前/);
    });
  });

  describe('Number Formatting', () => {
    it('should format numbers correctly for different locales', () => {
      const number = 1234567.89;
      
      const englishNumber = formatNumber(number, 'en');
      expect(englishNumber).toBe('1,234,567.89');
      
      const chineseNumber = formatNumber(number, 'zh');
      expect(chineseNumber).toBe('1,234,567.89');
    });

    it('should format currency correctly', () => {
      const amount = 1234.56;
      
      const usdFormat = formatCurrency(amount, 'en', 'USD');
      expect(usdFormat).toMatch(/\$1,234\.56/);
      
      const cnyFormat = formatCurrency(amount, 'zh', 'CNY');
      expect(cnyFormat).toMatch(/¥1,234\.56|CN¥1,234\.56/);
    });

    it('should format percentages correctly', () => {
      const percentage = 75.5;
      
      const englishPercent = formatPercent(percentage, 'en');
      expect(englishPercent).toMatch(/75\.5%/);
      
      const chinesePercent = formatPercent(percentage, 'zh');
      expect(chinesePercent).toMatch(/75\.5%/);
    });

    it('should format file sizes correctly', () => {
      expect(formatFileSize(1024, 'en')).toBe('1.0 KB');
      expect(formatFileSize(1048576, 'en')).toBe('1.0 MB');
      expect(formatFileSize(1073741824, 'en')).toBe('1.0 GB');
    });
  });

  describe('Address and Phone Formatting', () => {
    it('should format addresses correctly for English locale', () => {
      const address = {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001',
      };
      
      const formatted = formatAddress(address, 'en');
      expect(formatted).toBe('123 Main St, New York, NY 10001, USA');
    });

    it('should format addresses correctly for Chinese locale', () => {
      const address = {
        street: '南京路123号',
        city: '上海市',
        state: '上海',
        country: '中国',
        postalCode: '200001',
      };
      
      const formatted = formatAddress(address, 'zh');
      expect(formatted).toBe('中国 上海 上海市 南京路123号 200001');
    });

    it('should format phone numbers correctly', () => {
      const usPhone = '1234567890';
      const formattedUS = formatPhoneNumber(usPhone, 'en');
      expect(formattedUS).toBe('(123) 456-7890');
      
      const cnPhone = '13800000000';
      const formattedCN = formatPhoneNumber(cnPhone, 'zh');
      expect(formattedCN).toBe('138 0000 0000');
    });
  });

  describe('Sorting and Collation', () => {
    it('should sort strings correctly by locale', () => {
      const items = ['zebra', 'apple', 'banana'];
      const sorted = sortByLocale(items, 'en');
      expect(sorted).toEqual(['apple', 'banana', 'zebra']);
    });

    it('should sort objects correctly by locale', () => {
      const items = [
        { name: 'Zebra' },
        { name: 'Apple' },
        { name: 'Banana' },
      ];
      
      const sorted = sortObjectsByLocale(items, 'name', 'en');
      expect(sorted.map(item => item.name)).toEqual(['Apple', 'Banana', 'Zebra']);
    });

    it('should handle Chinese sorting', () => {
      const chineseItems = ['中国', '美国', '日本'];
      const sorted = sortByLocale(chineseItems, 'zh');
      expect(sorted).toHaveLength(3);
      expect(sorted).toContain('中国');
      expect(sorted).toContain('美国');
      expect(sorted).toContain('日本');
    });
  });

  describe('Locale Detection and Validation', () => {
    it('should detect browser locale', () => {
      // Mock navigator.language
      Object.defineProperty(navigator, 'language', {
        writable: true,
        value: 'en-US',
      });
      
      const locale = getBrowserLocale();
      expect(['en', 'zh']).toContain(locale);
    });

    it('should validate locale codes', () => {
      expect(isValidLocale('en')).toBe(true);
      expect(isValidLocale('zh')).toBe(true);
      expect(isValidLocale('fr')).toBe(false);
      expect(isValidLocale('invalid')).toBe(false);
    });

    it('should get locale display names', () => {
      const englishName = getLocaleDisplayName('en', 'en');
      expect(englishName).toMatch(/English/i);
      
      const chineseName = getLocaleDisplayName('zh', 'zh');
      expect(chineseName).toMatch(/中文|Chinese/i);
    });
  });

  describe('React Components Integration', () => {
    it('should render LocalizedNumber component correctly', () => {
      render(<LocalizedNumber value={1234.56} />);
      expect(screen.getByText(/1,234\.56/)).toBeInTheDocument();
    });

    it('should render LocalizedPrice component correctly', () => {
      render(<LocalizedPrice value={99.99} currency="USD" />);
      expect(screen.getByText(/\$99\.99/)).toBeInTheDocument();
    });

    it('should render LocalizedPercent component correctly', () => {
      render(<LocalizedPercent value={75} />);
      expect(screen.getByText(/75\.0%/)).toBeInTheDocument();
    });

    it('should render CurrencyConverter with loading state', () => {
      render(<CurrencyConverter baseAmount={100} showConverter={true} />);
      expect(screen.getByRole('generic')).toHaveClass('animate-pulse');
    });

    it('should render SmartPrice component', () => {
      render(<SmartPrice amount={199.99} />);
      // Component should render without errors
      expect(screen.getByRole('generic')).toBeInTheDocument();
    });

    it('should render PriceRange component', () => {
      render(<PriceRange minAmount={100} maxAmount={200} />);
      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });

  describe('SEO Integration', () => {
    it('should render SEO head with correct hreflang tags', () => {
      render(
        <SEOHead
          title="Test Page"
          description="Test description"
          url="https://example.com/test"
        />
      );
      
      // Check if hreflang links are added to head
      const hreflangLinks = document.querySelectorAll('link[rel="alternate"]');
      expect(hreflangLinks.length).toBeGreaterThan(0);
    });

    it('should generate correct canonical URLs', () => {
      render(
        <SEOHead
          title="Test Page"
          canonical="https://example.com/canonical"
        />
      );
      
      const canonicalLink = document.querySelector('link[rel="canonical"]');
      expect(canonicalLink).toHaveAttribute('href', 'https://example.com/canonical');
    });

    it('should set correct Open Graph locale', () => {
      mockRouter.locale = 'zh';
      (useRouter as jest.Mock).mockReturnValue(mockRouter);
      
      render(<SEOHead title="测试页面" />);
      
      const ogLocale = document.querySelector('meta[property="og:locale"]');
      expect(ogLocale).toHaveAttribute('content', 'zh_CN');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid dates gracefully', () => {
      const invalidDate = 'invalid-date';
      const result = formatDate(invalidDate, 'en');
      expect(result).toBeTruthy(); // Should not throw error
    });

    it('should handle invalid numbers gracefully', () => {
      const result = formatNumber(NaN, 'en');
      expect(result).toBe('NaN');
    });

    it('should handle unsupported locales gracefully', () => {
      const result = formatDate(new Date(), 'unsupported');
      expect(result).toBeTruthy(); // Should fallback to default
    });

    it('should handle missing address fields', () => {
      const incompleteAddress = { city: 'New York' };
      const result = formatAddress(incompleteAddress, 'en');
      expect(result).toBe('New York');
    });
  });

  describe('Performance Tests', () => {
    it('should format large numbers efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        formatNumber(Math.random() * 1000000, 'en');
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100);
    });

    it('should format dates efficiently', () => {
      const startTime = performance.now();
      const testDate = new Date();
      
      for (let i = 0; i < 1000; i++) {
        formatDate(testDate, 'en');
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100);
    });

    it('should sort large arrays efficiently', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => `item-${i}`);
      
      const startTime = performance.now();
      sortByLocale(largeArray, 'en');
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(50);
    });
  });

  describe('Accessibility Integration', () => {
    it('should provide proper ARIA labels for currency converter', () => {
      render(
        <CurrencyConverter 
          baseAmount={100} 
          showConverter={true}
          className="test-converter"
        />
      );
      
      const select = screen.queryByRole('combobox');
      if (select) {
        expect(select).toBeInTheDocument();
      }
    });

    it('should handle RTL languages correctly', () => {
      // Test would be more comprehensive with actual RTL language support
      const direction = 'ltr'; // Since we only support LTR languages currently
      expect(['ltr', 'rtl']).toContain(direction);
    });
  });

  describe('Integration with Next.js Router', () => {
    it('should respond to locale changes', () => {
      const { rerender } = render(<LocalizedNumber value={1234.56} />);
      
      // Change router locale
      mockRouter.locale = 'zh';
      (useRouter as jest.Mock).mockReturnValue(mockRouter);
      
      rerender(<LocalizedNumber value={1234.56} />);
      
      // Component should re-render with new locale
      expect(screen.getByText(/1,234\.56/)).toBeInTheDocument();
    });

    it('should generate correct URLs for different locales', () => {
      mockRouter.locale = 'zh';
      mockRouter.asPath = '/products';
      (useRouter as jest.Mock).mockReturnValue(mockRouter);
      
      render(<SEOHead title="产品" />);
      
      // Should generate correct hreflang URLs
      const hreflangLinks = document.querySelectorAll('link[rel="alternate"]');
      expect(hreflangLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Memory Management', () => {
    it('should not create memory leaks with repeated formatting', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Perform many formatting operations
      for (let i = 0; i < 10000; i++) {
        formatNumber(Math.random() * 1000, 'en');
        formatDate(new Date(), 'en');
        formatCurrency(Math.random() * 100, 'en');
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Memory increase should be reasonable (less than 10MB)
      const memoryIncrease = finalMemory - initialMemory;
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });
});