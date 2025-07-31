export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  children?: NavigationItem[];
  icon?: string;
  badge?: string;
  external?: boolean;
  disabled?: boolean;
}

export interface NavigationProps {
  items: NavigationItem[];
  currentPath: string;
  locale: 'en' | 'zh';
  onLocaleChange: (locale: 'en' | 'zh') => void;
  isScrolled?: boolean;
  className?: string;
}

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: NavigationItem[];
  currentPath: string;
  locale: 'en' | 'zh';
  onLocaleChange: (locale: 'en' | 'zh') => void;
}

export interface DropdownMenuProps {
  items: NavigationItem[];
  currentPath: string;
  isOpen: boolean;
  onClose: () => void;
  trigger: React.ReactNode;
  className?: string;
}

export interface LanguageSwitcherProps {
  currentLocale: 'en' | 'zh';
  onLocaleChange: (locale: 'en' | 'zh') => void;
  className?: string;
  variant?: 'default' | 'compact';
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}