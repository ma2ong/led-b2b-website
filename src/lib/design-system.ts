/**
 * 设计系统工具函数
 * 提供访问CSS变量和设计令牌的JavaScript接口
 */

// 颜色系统
export const colors = {
  primary: {
    50: 'var(--primary-50)',
    100: 'var(--primary-100)',
    200: 'var(--primary-200)',
    300: 'var(--primary-300)',
    400: 'var(--primary-400)',
    500: 'var(--primary-500)',
    600: 'var(--primary-600)',
    700: 'var(--primary-700)',
    800: 'var(--primary-800)',
    900: 'var(--primary-900)',
  },
  accent: {
    50: 'var(--accent-50)',
    100: 'var(--accent-100)',
    200: 'var(--accent-200)',
    300: 'var(--accent-300)',
    400: 'var(--accent-400)',
    500: 'var(--accent-500)',
    600: 'var(--accent-600)',
    700: 'var(--accent-700)',
    800: 'var(--accent-800)',
    900: 'var(--accent-900)',
  },
  success: {
    50: 'var(--success-50)',
    100: 'var(--success-100)',
    200: 'var(--success-200)',
    300: 'var(--success-300)',
    400: 'var(--success-400)',
    500: 'var(--success-500)',
    600: 'var(--success-600)',
    700: 'var(--success-700)',
    800: 'var(--success-800)',
    900: 'var(--success-900)',
  },
  warning: {
    50: 'var(--warning-50)',
    100: 'var(--warning-100)',
    200: 'var(--warning-200)',
    300: 'var(--warning-300)',
    400: 'var(--warning-400)',
    500: 'var(--warning-500)',
    600: 'var(--warning-600)',
    700: 'var(--warning-700)',
    800: 'var(--warning-800)',
    900: 'var(--warning-900)',
  },
  error: {
    50: 'var(--error-50)',
    100: 'var(--error-100)',
    200: 'var(--error-200)',
    300: 'var(--error-300)',
    400: 'var(--error-400)',
    500: 'var(--error-500)',
    600: 'var(--error-600)',
    700: 'var(--error-700)',
    800: 'var(--error-800)',
    900: 'var(--error-900)',
  },
  gray: {
    50: 'var(--gray-50)',
    100: 'var(--gray-100)',
    200: 'var(--gray-200)',
    300: 'var(--gray-300)',
    400: 'var(--gray-400)',
    500: 'var(--gray-500)',
    600: 'var(--gray-600)',
    700: 'var(--gray-700)',
    800: 'var(--gray-800)',
    900: 'var(--gray-900)',
  },
} as const;

// 间距系统
export const spacing = {
  0: 'var(--space-0)',
  px: 'var(--space-px)',
  0.5: 'var(--space-0-5)',
  1: 'var(--space-1)',
  1.5: 'var(--space-1-5)',
  2: 'var(--space-2)',
  2.5: 'var(--space-2-5)',
  3: 'var(--space-3)',
  3.5: 'var(--space-3-5)',
  4: 'var(--space-4)',
  5: 'var(--space-5)',
  6: 'var(--space-6)',
  7: 'var(--space-7)',
  8: 'var(--space-8)',
  9: 'var(--space-9)',
  10: 'var(--space-10)',
  11: 'var(--space-11)',
  12: 'var(--space-12)',
  14: 'var(--space-14)',
  16: 'var(--space-16)',
  18: 'var(--space-18)',
  20: 'var(--space-20)',
  24: 'var(--space-24)',
  28: 'var(--space-28)',
  32: 'var(--space-32)',
  36: 'var(--space-36)',
  40: 'var(--space-40)',
  44: 'var(--space-44)',
  48: 'var(--space-48)',
  52: 'var(--space-52)',
  56: 'var(--space-56)',
  60: 'var(--space-60)',
  64: 'var(--space-64)',
  72: 'var(--space-72)',
  80: 'var(--space-80)',
  96: 'var(--space-96)',
} as const;

// 字体系统
export const fonts = {
  primary: 'var(--font-primary)',
  display: 'var(--font-display)',
  chinese: 'var(--font-chinese)',
  mono: 'var(--font-mono)',
} as const;

export const fontSizes = {
  xs: 'var(--text-xs)',
  sm: 'var(--text-sm)',
  base: 'var(--text-base)',
  lg: 'var(--text-lg)',
  xl: 'var(--text-xl)',
  '2xl': 'var(--text-2xl)',
  '3xl': 'var(--text-3xl)',
  '4xl': 'var(--text-4xl)',
  '5xl': 'var(--text-5xl)',
  '6xl': 'var(--text-6xl)',
  '7xl': 'var(--text-7xl)',
  '8xl': 'var(--text-8xl)',
  '9xl': 'var(--text-9xl)',
} as const;

export const fontWeights = {
  thin: 'var(--font-thin)',
  light: 'var(--font-light)',
  normal: 'var(--font-normal)',
  medium: 'var(--font-medium)',
  semibold: 'var(--font-semibold)',
  bold: 'var(--font-bold)',
  extrabold: 'var(--font-extrabold)',
  black: 'var(--font-black)',
} as const;

// 阴影系统
export const shadows = {
  xs: 'var(--shadow-xs)',
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  xl: 'var(--shadow-xl)',
  '2xl': 'var(--shadow-2xl)',
  inner: 'var(--shadow-inner)',
  soft: 'var(--shadow-soft)',
  medium: 'var(--shadow-medium)',
  large: 'var(--shadow-large)',
  glow: 'var(--shadow-glow)',
  glowAccent: 'var(--shadow-glow-accent)',
} as const;

// 边框半径系统
export const borderRadius = {
  none: 'var(--radius-none)',
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
  '2xl': 'var(--radius-2xl)',
  '3xl': 'var(--radius-3xl)',
  full: 'var(--radius-full)',
} as const;

// 动画系统
export const durations = {
  75: 'var(--duration-75)',
  100: 'var(--duration-100)',
  150: 'var(--duration-150)',
  200: 'var(--duration-200)',
  300: 'var(--duration-300)',
  500: 'var(--duration-500)',
  700: 'var(--duration-700)',
  1000: 'var(--duration-1000)',
} as const;

export const easings = {
  linear: 'var(--ease-linear)',
  in: 'var(--ease-in)',
  out: 'var(--ease-out)',
  inOut: 'var(--ease-in-out)',
  bounce: 'var(--ease-bounce)',
  elastic: 'var(--ease-elastic)',
} as const;

// Z-index系统
export const zIndex = {
  0: 'var(--z-0)',
  10: 'var(--z-10)',
  20: 'var(--z-20)',
  30: 'var(--z-30)',
  40: 'var(--z-40)',
  50: 'var(--z-50)',
  auto: 'var(--z-auto)',
  dropdown: 'var(--z-dropdown)',
  sticky: 'var(--z-sticky)',
  fixed: 'var(--z-fixed)',
  modalBackdrop: 'var(--z-modal-backdrop)',
  modal: 'var(--z-modal)',
  popover: 'var(--z-popover)',
  tooltip: 'var(--z-tooltip)',
  toast: 'var(--z-toast)',
} as const;

// 断点系统
export const breakpoints = {
  xs: 'var(--breakpoint-xs)',
  sm: 'var(--breakpoint-sm)',
  md: 'var(--breakpoint-md)',
  lg: 'var(--breakpoint-lg)',
  xl: 'var(--breakpoint-xl)',
  '2xl': 'var(--breakpoint-2xl)',
  '3xl': 'var(--breakpoint-3xl)',
} as const;

// LED行业特定颜色
export const ledColors = {
  indoor: 'var(--spec-indoor)',
  outdoor: 'var(--spec-outdoor)',
  rental: 'var(--spec-rental)',
  creative: 'var(--spec-creative)',
  transparent: 'var(--spec-transparent)',
  certCE: 'var(--cert-ce)',
  certFCC: 'var(--cert-fcc)',
  certRoHS: 'var(--cert-rohs)',
  certISO: 'var(--cert-iso)',
} as const;

/**
 * 获取CSS变量的计算值
 */
export function getCSSVariable(variable: string): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

/**
 * 设置CSS变量的值
 */
export function setCSSVariable(variable: string, value: string): void {
  if (typeof window === 'undefined') return;
  document.documentElement.style.setProperty(variable, value);
}

/**
 * 根据像素间距获取对应的颜色
 */
export function getPixelPitchColor(pitch: string): string {
  const pitchValue = parseFloat(pitch.replace('P', ''));
  
  if (pitchValue < 1) return colors.success[600];
  if (pitchValue < 2) return colors.primary[600];
  if (pitchValue < 5) return colors.accent[600];
  return colors.gray[600];
}

/**
 * 根据亮度级别获取对应的颜色
 */
export function getBrightnessColor(brightness: number): string {
  if (brightness < 1500) return colors.gray[400];
  if (brightness < 3000) return colors.warning[400];
  if (brightness < 6000) return colors.accent[400];
  return colors.error[400];
}

/**
 * 生成渐变背景样式
 */
export function createGradient(
  direction: string = '135deg',
  startColor: string,
  endColor: string
): string {
  return `linear-gradient(${direction}, ${startColor}, ${endColor})`;
}

/**
 * 创建响应式样式对象
 */
export function createResponsiveStyles(styles: {
  base?: React.CSSProperties;
  sm?: React.CSSProperties;
  md?: React.CSSProperties;
  lg?: React.CSSProperties;
  xl?: React.CSSProperties;
  '2xl'?: React.CSSProperties;
}): React.CSSProperties {
  // 这里只返回基础样式，响应式样式需要通过CSS类来实现
  return styles.base || {};
}

/**
 * 设计令牌类型定义
 */
export type ColorToken = keyof typeof colors;
export type SpacingToken = keyof typeof spacing;
export type FontToken = keyof typeof fonts;
export type FontSizeToken = keyof typeof fontSizes;
export type FontWeightToken = keyof typeof fontWeights;
export type ShadowToken = keyof typeof shadows;
export type BorderRadiusToken = keyof typeof borderRadius;
export type DurationToken = keyof typeof durations;
export type EasingToken = keyof typeof easings;
export type ZIndexToken = keyof typeof zIndex;
export type BreakpointToken = keyof typeof breakpoints;
export type LEDColorToken = keyof typeof ledColors;

/**
 * 设计系统配置
 */
export const designSystem = {
  colors,
  spacing,
  fonts,
  fontSizes,
  fontWeights,
  shadows,
  borderRadius,
  durations,
  easings,
  zIndex,
  breakpoints,
  ledColors,
  utils: {
    getCSSVariable,
    setCSSVariable,
    getPixelPitchColor,
    getBrightnessColor,
    createGradient,
    createResponsiveStyles,
  },
} as const;

export default designSystem;