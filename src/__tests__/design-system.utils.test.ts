import {
  colors,
  spacing,
  fonts,
  getCSSVariable,
  setCSSVariable,
  getPixelPitchColor,
  getBrightnessColor,
  createGradient,
  designSystem,
} from '@/lib/design-system';

// Mock DOM methods
const mockGetComputedStyle = jest.fn();
const mockSetProperty = jest.fn();

Object.defineProperty(window, 'getComputedStyle', {
  value: mockGetComputedStyle,
});

Object.defineProperty(document, 'documentElement', {
  value: {
    style: {
      setProperty: mockSetProperty,
    },
  },
});

describe('Design System Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Color System', () => {
    it('should have all primary color variants', () => {
      expect(colors.primary).toHaveProperty('50');
      expect(colors.primary).toHaveProperty('500');
      expect(colors.primary).toHaveProperty('900');
      expect(colors.primary[600]).toBe('var(--primary-600)');
    });

    it('should have all accent color variants', () => {
      expect(colors.accent).toHaveProperty('50');
      expect(colors.accent).toHaveProperty('500');
      expect(colors.accent).toHaveProperty('900');
      expect(colors.accent[500]).toBe('var(--accent-500)');
    });

    it('should have all success color variants', () => {
      expect(colors.success).toHaveProperty('50');
      expect(colors.success).toHaveProperty('500');
      expect(colors.success).toHaveProperty('900');
      expect(colors.success[500]).toBe('var(--success-500)');
    });
  });

  describe('Spacing System', () => {
    it('should have all spacing values', () => {
      expect(spacing).toHaveProperty('0');
      expect(spacing).toHaveProperty('4');
      expect(spacing).toHaveProperty('96');
      expect(spacing[4]).toBe('var(--space-4)');
    });
  });

  describe('Font System', () => {
    it('should have all font families', () => {
      expect(fonts).toHaveProperty('primary');
      expect(fonts).toHaveProperty('display');
      expect(fonts).toHaveProperty('chinese');
      expect(fonts.primary).toBe('var(--font-primary)');
    });
  });

  describe('getCSSVariable', () => {
    it('should return empty string on server side', () => {
      // Temporarily remove window
      const originalWindow = global.window;
      delete (global as any).window;

      const result = getCSSVariable('--primary-600');
      expect(result).toBe('');

      // Restore window
      global.window = originalWindow;
    });

    it('should get CSS variable value from computed style', () => {
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: jest.fn().mockReturnValue('  #1e40af  '),
      });

      const result = getCSSVariable('--primary-600');
      expect(result).toBe('#1e40af');
      expect(mockGetComputedStyle).toHaveBeenCalledWith(document.documentElement);
    });
  });

  describe('setCSSVariable', () => {
    it('should do nothing on server side', () => {
      // Temporarily remove window
      const originalWindow = global.window;
      delete (global as any).window;

      setCSSVariable('--primary-600', '#1e40af');
      expect(mockSetProperty).not.toHaveBeenCalled();

      // Restore window
      global.window = originalWindow;
    });

    it('should set CSS variable value', () => {
      setCSSVariable('--primary-600', '#1e40af');
      expect(mockSetProperty).toHaveBeenCalledWith('--primary-600', '#1e40af');
    });
  });

  describe('getPixelPitchColor', () => {
    it('should return success color for fine pitch (< 1mm)', () => {
      expect(getPixelPitchColor('P0.9')).toBe(colors.success[600]);
      expect(getPixelPitchColor('P0.625')).toBe(colors.success[600]);
    });

    it('should return primary color for small pitch (1-2mm)', () => {
      expect(getPixelPitchColor('P1.25')).toBe(colors.primary[600]);
      expect(getPixelPitchColor('P1.56')).toBe(colors.primary[600]);
      expect(getPixelPitchColor('P1.86')).toBe(colors.primary[600]);
    });

    it('should return accent color for medium pitch (2-5mm)', () => {
      expect(getPixelPitchColor('P2.5')).toBe(colors.accent[600]);
      expect(getPixelPitchColor('P3')).toBe(colors.accent[600]);
      expect(getPixelPitchColor('P4')).toBe(colors.accent[600]);
    });

    it('should return gray color for large pitch (≥ 5mm)', () => {
      expect(getPixelPitchColor('P5')).toBe(colors.gray[600]);
      expect(getPixelPitchColor('P6')).toBe(colors.gray[600]);
      expect(getPixelPitchColor('P8')).toBe(colors.gray[600]);
      expect(getPixelPitchColor('P10')).toBe(colors.gray[600]);
    });
  });

  describe('getBrightnessColor', () => {
    it('should return gray for low brightness (< 1500 nits)', () => {
      expect(getBrightnessColor(800)).toBe(colors.gray[400]);
      expect(getBrightnessColor(1200)).toBe(colors.gray[400]);
    });

    it('should return warning for medium brightness (1500-3000 nits)', () => {
      expect(getBrightnessColor(2000)).toBe(colors.warning[400]);
      expect(getBrightnessColor(2500)).toBe(colors.warning[400]);
    });

    it('should return accent for high brightness (3000-6000 nits)', () => {
      expect(getBrightnessColor(4000)).toBe(colors.accent[400]);
      expect(getBrightnessColor(5000)).toBe(colors.accent[400]);
    });

    it('should return error for ultra brightness (≥ 6000 nits)', () => {
      expect(getBrightnessColor(7000)).toBe(colors.error[400]);
      expect(getBrightnessColor(8000)).toBe(colors.error[400]);
    });
  });

  describe('createGradient', () => {
    it('should create gradient with default direction', () => {
      const gradient = createGradient(undefined, '#1e40af', '#3b82f6');
      expect(gradient).toBe('linear-gradient(135deg, #1e40af, #3b82f6)');
    });

    it('should create gradient with custom direction', () => {
      const gradient = createGradient('90deg', '#1e40af', '#3b82f6');
      expect(gradient).toBe('linear-gradient(90deg, #1e40af, #3b82f6)');
    });

    it('should create gradient with CSS variables', () => {
      const gradient = createGradient('45deg', colors.primary[600], colors.accent[500]);
      expect(gradient).toBe('linear-gradient(45deg, var(--primary-600), var(--accent-500))');
    });
  });

  describe('Design System Export', () => {
    it('should export complete design system', () => {
      expect(designSystem).toHaveProperty('colors');
      expect(designSystem).toHaveProperty('spacing');
      expect(designSystem).toHaveProperty('fonts');
      expect(designSystem).toHaveProperty('utils');
    });

    it('should have utility functions', () => {
      expect(designSystem.utils).toHaveProperty('getCSSVariable');
      expect(designSystem.utils).toHaveProperty('setCSSVariable');
      expect(designSystem.utils).toHaveProperty('getPixelPitchColor');
      expect(designSystem.utils).toHaveProperty('getBrightnessColor');
      expect(designSystem.utils).toHaveProperty('createGradient');
    });
  });
});