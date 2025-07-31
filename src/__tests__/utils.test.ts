import {
  cn,
  formatDate,
  formatCurrency,
  generateId,
  debounce,
  isEmpty,
  slugify,
  truncate,
  isValidEmail,
  isValidPhone,
} from '@/lib/utils';

describe('Utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
      expect(cn('class1', undefined, 'class2')).toBe('class1 class2');
      expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly for English', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date, 'en');
      expect(formatted).toContain('January');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });

    it('should format date correctly for Chinese', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date, 'zh');
      expect(formatted).toContain('2024');
    });
  });

  describe('formatCurrency', () => {
    it('should format USD currency correctly', () => {
      expect(formatCurrency(1000, 'USD', 'en')).toBe('$1,000.00');
    });

    it('should format CNY currency correctly', () => {
      expect(formatCurrency(1000, 'CNY', 'zh')).toContain('1,000.00');
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });
  });

  describe('debounce', () => {
    jest.useFakeTimers();

    it('should debounce function calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    afterEach(() => {
      jest.clearAllTimers();
    });
  });

  describe('isEmpty', () => {
    it('should correctly identify empty values', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
      
      expect(isEmpty('hello')).toBe(false);
      expect(isEmpty([1, 2, 3])).toBe(false);
      expect(isEmpty({ key: 'value' })).toBe(false);
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(false)).toBe(false);
    });
  });

  describe('slugify', () => {
    it('should convert text to URL-friendly slug', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('LED Display & Screen')).toBe('led-display-screen');
      expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces');
      expect(slugify('Special!@#$%Characters')).toBe('specialcharacters');
    });
  });

  describe('truncate', () => {
    it('should truncate text correctly', () => {
      const text = 'This is a long text that needs to be truncated';
      expect(truncate(text, 10)).toBe('This is a...');
      expect(truncate(text, 10, '---')).toBe('This is a---');
      expect(truncate('Short', 10)).toBe('Short');
    });
  });

  describe('isValidEmail', () => {
    it('should validate email addresses correctly', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
      
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate phone numbers correctly', () => {
      expect(isValidPhone('+1234567890')).toBe(true);
      expect(isValidPhone('1234567890')).toBe(true);
      expect(isValidPhone('+86 138 0013 8000')).toBe(true);
      expect(isValidPhone('+86-138-0013-8000')).toBe(true);
      expect(isValidPhone('+86 (138) 0013-8000')).toBe(true);
      
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc123')).toBe(false);
      expect(isValidPhone('')).toBe(false);
      expect(isValidPhone('+0123456789')).toBe(false);
    });
  });
});