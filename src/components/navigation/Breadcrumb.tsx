import React from 'react';
import Link from 'next/link';
import { HomeIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import { cn } from '@/lib/utils';
import type { BreadcrumbProps } from '@/types/navigation';

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  const { t } = useTranslation('common');

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav
      className={cn('flex items-center space-x-1 text-sm text-gray-500', className)}
      aria-label={t('navigation.breadcrumb')}
    >
      {/* Home link */}
      <Link
        href="/"
        className="flex items-center hover:text-primary-600 transition-colors"
        aria-label={t('navigation.home')}
      >
        <HomeIcon className="w-4 h-4" />
        <span className="sr-only md:not-sr-only md:ml-1">Home</span>
      </Link>

      {/* Breadcrumb items */}
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          
          {item.current ? (
            <span
              className="font-medium text-gray-900"
              aria-current="page"
            >
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href!}
              className="hover:text-primary-600 transition-colors"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;