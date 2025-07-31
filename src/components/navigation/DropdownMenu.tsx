import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import type { DropdownMenuProps, NavigationItem } from '@/types/navigation';

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  items,
  currentPath,
  isOpen,
  onClose,
  trigger,
  className,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const isActiveItem = (href: string): boolean => {
    if (href === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(href);
  };

  const renderMenuItem = (item: NavigationItem, level: number = 0) => {
    const isActive = isActiveItem(item.href);
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <div key={item.id} className="relative group">
          <div
            className={cn(
              'flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors cursor-pointer',
              level === 0 ? 'text-gray-700 hover:text-primary-600 hover:bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
              isActive && 'text-primary-600 bg-primary-50'
            )}
          >
            <span>{item.label}</span>
            <ChevronRightIcon className="w-4 h-4" />
          </div>
          
          {/* 子菜单 */}
          <div className="absolute left-full top-0 hidden group-hover:block min-w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 z-dropdown animate-fade-in">
            {item.children?.map((child) => renderMenuItem(child, level + 1))}
          </div>
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.href}
        onClick={onClose}
        className={cn(
          'block px-4 py-3 text-sm font-medium transition-colors',
          level === 0 ? 'text-gray-700 hover:text-primary-600 hover:bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
          isActive && 'text-primary-600 bg-primary-50',
          item.disabled && 'opacity-50 cursor-not-allowed'
        )}
        {...(item.external && { target: '_blank', rel: 'noopener noreferrer' })}
      >
        <div className="flex items-center justify-between">
          <span>{item.label}</span>
          {item.badge && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-accent-100 text-accent-800 rounded-full">
              {item.badge}
            </span>
          )}
          {item.external && (
            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          )}
        </div>
      </Link>
    );
  };

  if (!isOpen) return null;

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {trigger}
      <div className="absolute left-0 top-full mt-2 min-w-[240px] bg-white rounded-lg shadow-lg border border-gray-200 z-dropdown animate-fade-in">
        <div className="py-2">
          {items.map((item) => renderMenuItem(item))}
        </div>
      </div>
    </div>
  );
};

export default DropdownMenu;