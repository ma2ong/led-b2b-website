import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Bars3Icon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import LanguageSwitcher from './LanguageSwitcher';
import DropdownMenu from './DropdownMenu';
import MobileMenu from './MobileMenu';
import type { NavigationProps, NavigationItem } from '@/types/navigation';

const Navigation: React.FC<NavigationProps> = ({
  items,
  currentPath,
  locale,
  onLocaleChange,
  isScrolled = false,
  className,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useTranslation('common');

  useEffect(() => {
    const handleRouteChange = () => {
      setIsMobileMenuOpen(false);
      setActiveDropdown(null);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [router.events]);

  const isActiveItem = (href: string): boolean => {
    if (href === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(href);
  };

  const handleDropdownToggle = (itemId: string) => {
    setActiveDropdown(activeDropdown === itemId ? null : itemId);
  };

  const renderDesktopMenuItem = (item: NavigationItem) => {
    const isActive = isActiveItem(item.href);
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <div key={item.id} className="relative">
          <button
            onClick={() => handleDropdownToggle(item.id)}
            onMouseEnter={() => setActiveDropdown(item.id)}
            className={cn(
              'nav-link flex items-center gap-1',
              isActive && 'active'
            )}
            aria-expanded={activeDropdown === item.id}
            aria-haspopup="true"
          >
            <span>{item.label}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <DropdownMenu
            items={item.children || []}
            currentPath={currentPath}
            isOpen={activeDropdown === item.id}
            onClose={() => setActiveDropdown(null)}
            trigger={<div />}
          />
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.href}
        className={cn(
          'nav-link',
          isActive && 'active',
          item.disabled && 'opacity-50 cursor-not-allowed'
        )}
        {...(item.external && { target: '_blank', rel: 'noopener noreferrer' })}
      >
        <span>{item.label}</span>
        {item.badge && (
          <span className="ml-1 px-2 py-0.5 text-xs font-medium bg-accent-100 text-accent-800 rounded-full">
            {item.badge}
          </span>
        )}
        {item.external && (
          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        )}
      </Link>
    );
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-fixed transition-all duration-300',
          isScrolled
            ? 'bg-white/95 backdrop-blur-sm shadow-md'
            : 'bg-white',
          className
        )}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <div className="hidden sm:block">
                  <div className="text-xl font-bold text-gray-900">Lejin LED</div>
                  <div className="text-xs text-gray-500">{t('company.shortName')}</div>
                </div>
              </Link>
            </div>

            {/* 桌面端导航 */}
            <nav className="hidden lg:flex items-center space-x-1">
              {items.map(renderDesktopMenuItem)}
            </nav>

            {/* 右侧操作区 */}
            <div className="flex items-center gap-4">
              {/* 搜索按钮 */}
              <button
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={t('navigation.search')}
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>

              {/* 语言切换 - 桌面端 */}
              <div className="hidden lg:block">
                <LanguageSwitcher
                  currentLocale={locale}
                  onLocaleChange={onLocaleChange}
                />
              </div>

              {/* CTA按钮 */}
              <div className="hidden md:block">
                <Link href="/contact" className="btn-primary btn-sm">
                  {t('buttons.getQuote')}
                </Link>
              </div>

              {/* 移动端菜单按钮 */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={t('navigation.openMenu')}
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* 进度条 - 滚动时显示 */}
        {isScrolled && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200">
            <div 
              className="h-full bg-gradient-to-r from-primary-600 to-accent-500 transition-all duration-300"
              style={{ 
                width: `${Math.min(100, (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100)}%` 
              }}
            />
          </div>
        )}
      </header>

      {/* 移动端菜单 */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        items={items}
        currentPath={currentPath}
        locale={locale}
        onLocaleChange={onLocaleChange}
      />

      {/* 页面内容的顶部间距 */}
      <div className="h-16 lg:h-20" />
    </>
  );
};

export default Navigation;