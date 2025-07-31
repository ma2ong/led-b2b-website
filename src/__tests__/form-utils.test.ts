import {
  validateField,
  validateForm,
  validationPatterns,
  commonRules,
  formatPhoneNumber,
  formatCurrency,
  parseNumber
} from '@/lib/form-utils';

describe('validateField', () => {
  it('validates required fields', () => {
    expect(validateField('', { required: true })).toBe('This field is required');
    expect(validateField('  ', { required: true })).toBe('This field is required');
    expect(validateField(null, { required: true })).toBe('This field is required');
    expect(validateField(undefined, { required: true })).toBe('This field is required');
    expect(validateField('value', { required: true })).toBeNull();
  });

  it('validates string length', () => {
    expect(validateField('ab', { minLength: 3 })).toBe('Must be at least 3 characters');
    expect(validateField('abc', { minLength: 3 })).toBeNull();
    expect(validateField('abcdef', { maxLength: 5 })).toBe('Must be no more than 5 characters');
    expect(validateField('abcde', { maxLength: 5 })).toBeNull();
  });

  it('validates patterns', () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(validateField('invalid-email', { pattern: emailPattern })).toBe('Invalid format');
    expect(validateField('valid@email.com', { pattern: emailPattern })).toBeNull();
  });

  it('validates number ranges', () => {
    expect(validateField(5, { min: 10 })).toBe('Must be at least 10');
    expect(validateField(10, { min: 10 })).toBeNull();
    expect(validateField(15, { max: 10 })).toBe('Must be no more than 10');
    expect(validateField(10, { max: 10 })).toBeNull();
  });

  it('validates with custom rules', () => {
    const customRule = (value: string) => {
      return value === 'forbidden' ? 'This value is not allowed' : null;
    };

    expect(validateField('forbidden', { custom: customRule })).toBe('This value is not allowed');
    expect(validateField('allowed', { custom: customRule })).toBeNull();
  });

  it('skips validation for empty non-required fields', () => {
    expect(validateField('', { minLength: 5, pattern: /\d+/ })).toBeNull();
    expect(validateField(null, { min: 10 })).toBeNull();
  });
});

describe('validateForm', () => {
  it('validates multiple fields', () => {
    const values = {
      email: 'invalid-email',
      password: '123',
      age: 15
    };

    const rules = {
      email: { required: true, pattern: validationPatterns.email },
      password: { required: true, minLength: 6 },
      age: { required: true, min: 18 }
    };

    const result = validateForm(values, rules);

    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBe('Invalid format');
    expect(result.errors.password).toBe('Must be at least 6 characters');
    expect(result.errors.age).toBe('Must be at least 18');
  });

  it('returns valid result for valid form', () => {
    const values = {
      email: 'user@example.com',
      password: 'password123',
      age: 25
    };

    const rules = {
      email: { required: true, pattern: validationPatterns.email },
      password: { required: true, minLength: 6 },
      age: { required: true, min: 18 }
    };

    const result = validateForm(values, rules);

    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });
});

describe('validationPatterns', () => {
  it('validates email pattern', () => {
    expect(validationPatterns.email.test('user@example.com')).toBe(true);
    expect(validationPatterns.email.test('user.name+tag@example.co.uk')).toBe(true);
    expect(validationPatterns.email.test('invalid-email')).toBe(false);
    expect(validationPatterns.email.test('user@')).toBe(false);
    expect(validationPatterns.email.test('@example.com')).toBe(false);
  });

  it('validates phone pattern', () => {
    expect(validationPatterns.phone.test('1234567890')).toBe(true);
    expect(validationPatterns.phone.test('+1234567890')).toBe(true);
    expect(validationPatterns.phone.test('123')).toBe(true);
    expect(validationPatterns.phone.test('0123456789')).toBe(false); // starts with 0
    expect(validationPatterns.phone.test('abc123')).toBe(false);
  });

  it('validates URL pattern', () => {
    expect(validationPatterns.url.test('https://example.com')).toBe(true);
    expect(validationPatterns.url.test('http://example.com')).toBe(true);
    expect(validationPatterns.url.test('https://sub.example.com/path')).toBe(true);
    expect(validationPatterns.url.test('example.com')).toBe(false);
    expect(validationPatterns.url.test('ftp://example.com')).toBe(false);
  });

  it('validates alphanumeric pattern', () => {
    expect(validationPatterns.alphanumeric.test('abc123')).toBe(true);
    expect(validationPatterns.alphanumeric.test('ABC123')).toBe(true);
    expect(validationPatterns.alphanumeric.test('abc-123')).toBe(false);
    expect(validationPatterns.alphanumeric.test('abc 123')).toBe(false);
  });

  it('validates numeric pattern', () => {
    expect(validationPatterns.numeric.test('123')).toBe(true);
    expect(validationPatterns.numeric.test('0')).toBe(true);
    expect(validationPatterns.numeric.test('123abc')).toBe(false);
    expect(validationPatterns.numeric.test('12.3')).toBe(false);
  });

  it('validates decimal pattern', () => {
    expect(validationPatterns.decimal.test('123')).toBe(true);
    expect(validationPatterns.decimal.test('123.45')).toBe(true);
    expect(validationPatterns.decimal.test('.45')).toBe(true);
    expect(validationPatterns.decimal.test('123.')).toBe(true);
    expect(validationPatterns.decimal.test('abc')).toBe(false);
    expect(validationPatterns.decimal.test('12.34.56')).toBe(false);
  });
});

describe('commonRules', () => {
  it('has email rule', () => {
    expect(commonRules.email.required).toBe(true);
    expect(commonRules.email.pattern).toBe(validationPatterns.email);
  });

  it('has phone rule', () => {
    expect(commonRules.phone.pattern).toBe(validationPatterns.phone);
  });

  it('has required rule', () => {
    expect(commonRules.required.required).toBe(true);
  });

  it('has URL rule', () => {
    expect(commonRules.url.pattern).toBe(validationPatterns.url);
  });
});

describe('formatPhoneNumber', () => {
  it('formats US phone numbers', () => {
    expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
    expect(formatPhoneNumber('123-456-7890')).toBe('(123) 456-7890');
    expect(formatPhoneNumber('(123) 456-7890')).toBe('(123) 456-7890');
  });

  it('returns original value for invalid numbers', () => {
    expect(formatPhoneNumber('123')).toBe('123');
    expect(formatPhoneNumber('12345678901')).toBe('12345678901');
    expect(formatPhoneNumber('abc')).toBe('abc');
  });
});

describe('formatCurrency', () => {
  it('formats currency values', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
  });
});

describe('parseNumber', () => {
  it('parses valid numbers', () => {
    expect(parseNumber('123')).toBe(123);
    expect(parseNumber('123.45')).toBe(123.45);
    expect(parseNumber('0')).toBe(0);
    expect(parseNumber('-123')).toBe(-123);
  });

  it('returns null for invalid numbers', () => {
    expect(parseNumber('abc')).toBeNull();
    expect(parseNumber('')).toBeNull();
    expect(parseNumber('123abc')).toBeNull();
  });
});