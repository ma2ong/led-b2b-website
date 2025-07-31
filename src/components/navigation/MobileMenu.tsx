import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { XMarkIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import LanguageSwitcher from './LanguageSwitcher';
import type { MobileMenuProps, NavigationItem } from '@/types/navigation';

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  items,
  currentPath,
  locale,
  onLocaleChange,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const isActiveItem = (href: string): boolean => {
    if (href === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(href);
  };

  const renderMenuItem = (item: NavigationItem, level: number = 0) => {
    const isActive = isActiveItem(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);

    return (
      <div key={item.id} className={cn('border-b border-gray-100 last:border-b-0')}>
        {hasChildren ? (
          <button
            onClick={() => toggleExpanded(item.id)}
            className={cn(
              'w-full flex items-center justify-between px-6 py-4 text-left transition-colors',
              level === 0 ? 'text-base font-medium' : 'text-sm font-normal pl-10',
              isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-900 hover:bg-gray-50'
            )}
          >
            <span>{item.label}</span>
            <ChevronDownIcon 
              className={cn('w-5 h-5 transition-transform', isExpanded && 'rotate-180')} 
            />
          </button>
        ) : (
          <Link
            href={item.href}
            onClick={onClose}
            className={cn(
              'block px-6 py-4 transition-colors',
              level === 0 ? 'text-base font-medium' : 'text-sm font-normal pl-10',
              isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-900 hover:bg-gray-50',
              item.disabled && 'opacity-50 cursor-not-allowed'
            )}
            {...(item.external && { target: '_blank', rel: 'noopener noreferrer' })}
          >
            <div className="flex items-center justify-between">
              <span>{item.label}</span>
              <div className="flex items-center gap-2">
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-accent-100 text-accent-800 rounded-full">
                    {item.badge}
                  </span>
                )}
                {item.external && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                )}
              </div>
            </div>
          </Link>
        )}

        {/* 子菜单 */}
        {hasChildren && isExpanded && (
          <div className="bg-gray-50">
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className={cn(
          'fixed inset-0 bg-black bg-opacity-50 z-modal-backdrop transition-opacity',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* 侧边菜单 */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl z-modal transition-transform',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close menu"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* 菜单内容 */}
        <div className="flex-1 overflow-y-auto">
          <nav className="py-2">
            {items.map((item) => renderMenuItem(item))}
          </nav>
        </div>

        {/* 底部 */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Language</span>
            <LanguageSwitcher
              currentLocale={locale}
              onLocaleChange={onLocaleChange}
              variant="compact"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;