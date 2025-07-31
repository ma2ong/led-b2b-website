import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import Navigation from '@/components/navigation/Navigation';
import LanguageSwitcher from '@/components/navigation/LanguageSwitcher';
import MobileMenu from '@/components/navigation/MobileMenu';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import type { NavigationItem } from '@/types/navigation';

// Mock next/router
const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    events: {
      on: jest.fn(),
      off: jest.fn(),
    },
    pathname: '/',
    asPath: '/',
    query: {},
  }),
}));

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockNavigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
  },
  {
    id: 'products',
    label: 'Products',
    href: '/products',
    children: [
      {
        id: 'fine-pitch',
        label: 'Fine Pitch LED',
        href: '/products/fine-pitch',
        badge: 'Popular',
      },
      {
        id: 'outdoor',
        label: 'Outdoor LED',
        href: '/products/outdoor',
      },
    ],
  },
  {
    id: 'about',
    label: 'About',
    href: '/about',
  },
];

describe('Navigation Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Navigation', () => {
    const defaultProps = {
      items: mockNavigationItems,
      currentPath: '/',
      locale: 'en' as const,
      onLocaleChange: jest.fn(),
    };

    it('renders navigation items correctly', () => {
      render(<Navigation {...defaultProps} />);
      
      // 检查桌面端导航中的项目
      const desktopNav = screen.getByRole('navigation');
      expect(desktopNav).toBeInTheDocument();
      
      // 使用更具体的查询来避免重复元素问题
      expect(screen.getAllByText('Home')).toHaveLength(2); // 桌面端和移动端各一个
      expect(screen.getAllByText('Products')).toHaveLength(2);
      expect(screen.getAllByText('About')).toHaveLength(2);
    });

    it('shows logo and company name', () => {
      render(<Navigation {...defaultProps} />);
      
      expect(screen.getByText('Lejin LED')).toBeInTheDocument();
      expect(screen.getByText('company.shortName')).toBeInTheDocument();
    });

    it('highlights active navigation item', () => {
      render(<Navigation {...defaultProps} currentPath="/about" />);
      
      // 查找桌面端导航中的活跃链接
      const desktopNav = screen.getByRole('navigation');
      const aboutLinks = screen.getAllByText('About');
      const desktopAboutLink = aboutLinks.find(link => 
        link.closest('nav')?.classList.contains('lg:flex')
      )?.closest('a');
      
      expect(desktopAboutLink).toHaveClass('active');
    });

    it('shows scrolled state when isScrolled is true', () => {
      const { container } = render(<Navigation {...defaultProps} isScrolled={true} />);
      
      const header = container.querySelector('header');
      expect(header).toHaveClass('bg-white/95', 'backdrop-blur-sm', 'shadow-md');
    });

    it('opens mobile menu when hamburger button is clicked', () => {
      render(<Navigation {...defaultProps} />);
      
      const hamburgerButton = screen.getByLabelText('navigation.openMenu');
      fireEvent.click(hamburgerButton);
      
      // Mobile menu should be rendered
      expect(screen.getByText('Menu')).toBeInTheDocument();
    });
  });

  describe('LanguageSwitcher', () => {
    const defaultProps = {
      currentLocale: 'en' as const,
      onLocaleChange: jest.fn(),
    };

    it('renders current language correctly', () => {
      render(<LanguageSwitcher {...defaultProps} />);
      
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('🇺🇸')).toBeInTheDocument();
    });

    it('opens dropdown when clicked', () => {
      render(<LanguageSwitcher {...defaultProps} />);
      
      const switcher = screen.getByTestId('language-switcher');
      fireEvent.click(switcher);
      
      expect(screen.getByText('navigation.selectLanguage')).toBeInTheDocument();
      expect(screen.getByTestId('language-option-zh')).toBeInTheDocument();
    });

    it('calls onLocaleChange when language is selected', async () => {
      const onLocaleChange = jest.fn();
      render(<LanguageSwitcher {...defaultProps} onLocaleChange={onLocaleChange} />);
      
      const switcher = screen.getByTestId('language-switcher');
      fireEvent.click(switcher);
      
      const chineseOption = screen.getByTestId('language-option-zh');
      fireEvent.click(chineseOption);
      
      expect(onLocaleChange).toHaveBeenCalledWith('zh');
      expect(mockPush).toHaveBeenCalled();
    });

    it('renders compact variant correctly', () => {
      render(<LanguageSwitcher {...defaultProps} variant="compact" />);
      
      const switcher = screen.getByTestId('language-switcher');
      expect(switcher).toHaveClass('px-2', 'py-1', 'text-sm');
    });
  });

  describe('MobileMenu', () => {
    const defaultProps = {
      isOpen: true,
      onClose: jest.fn(),
      items: mockNavigationItems,
      currentPath: '/',
      locale: 'en' as const,
      onLocaleChange: jest.fn(),
    };

    it('renders mobile menu when open', () => {
      render(<MobileMenu {...defaultProps} />);
      
      expect(screen.getByText('Menu')).toBeInTheDocument();
      // 移动端菜单中的导航项目
      const mobileMenuItems = screen.getAllByText('Home');
      expect(mobileMenuItems.length).toBeGreaterThan(0);
    });

    it('does not render when closed', () => {
      const { container } = render(<MobileMenu {...defaultProps} isOpen={false} />);
      
      // 检查移动端菜单容器是否有正确的隐藏类
      const mobileMenu = container.querySelector('.translate-x-full');
      expect(mobileMenu).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      const onClose = jest.fn();
      render(<MobileMenu {...defaultProps} onClose={onClose} />);
      
      const closeButton = screen.getByLabelText('Close menu');
      fireEvent.click(closeButton);
      
      expect(onClose).toHaveBeenCalled();
    });

    it('expands submenu when parent item is clicked', () => {
      render(<MobileMenu {...defaultProps} />);
      
      const productsButton = screen.getByText('Products');
      fireEvent.click(productsButton);
      
      expect(screen.getByText('Fine Pitch LED')).toBeInTheDocument();
      expect(screen.getByText('Outdoor LED')).toBeInTheDocument();
    });

    it('shows language switcher in footer', () => {
      render(<MobileMenu {...defaultProps} />);
      
      expect(screen.getByText('Language')).toBeInTheDocument();
    });
  });

  describe('Breadcrumb', () => {
    const breadcrumbItems = [
      { label: 'Products', href: '/products' },
      { label: 'Fine Pitch LED', href: '/products/fine-pitch' },
      { label: 'P1.25 Display', current: true },
    ];

    it('renders breadcrumb items correctly', () => {
      render(<Breadcrumb items={breadcrumbItems} />);
      
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Fine Pitch LED')).toBeInTheDocument();
      expect(screen.getByText('P1.25 Display')).toBeInTheDocument();
    });

    it('renders home icon as first item', () => {
      render(<Breadcrumb items={breadcrumbItems} />);
      
      const homeLink = screen.getByText('Home');
      expect(homeLink).toBeInTheDocument();
    });

    it('marks current item correctly', () => {
      render(<Breadcrumb items={breadcrumbItems} />);
      
      const currentItem = screen.getByText('P1.25 Display');
      expect(currentItem).toHaveAttribute('aria-current', 'page');
    });

    it('renders nothing when no items provided', () => {
      const { container } = render(<Breadcrumb items={[]} />);
      
      expect(container.firstChild).toBeNull();
    });

    it('creates links for non-current items', () => {
      render(<Breadcrumb items={breadcrumbItems} />);
      
      const productsLink = screen.getByText('Products').closest('a');
      expect(productsLink).toHaveAttribute('href', '/products');
      
      const finePitchLink = screen.getByText('Fine Pitch LED').closest('a');
      expect(finePitchLink).toHaveAttribute('href', '/products/fine-pitch');
    });
  });
});