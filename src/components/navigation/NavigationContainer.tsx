import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navigation from './Navigation';
import { getNavigationItems } from '@/data/navigation';
import type { NavigationItem } from '@/types/navigation';

interface NavigationContainerProps {
  className?: string;
}

const NavigationContainer: React.FC<NavigationContainerProps> = ({ className }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const { locale = 'en', pathname } = router;

  const navigationItems = getNavigationItems(locale as 'en' | 'zh');

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLocaleChange = async (newLocale: 'en' | 'zh') => {
    const { pathname, asPath, query } = router;
    await router.push({ pathname, query }, asPath, { locale: newLocale });
  };

  return (
    <Navigation
      items={navigationItems}
      currentPath={pathname}
      locale={locale as 'en' | 'zh'}
      onLocaleChange={handleLocaleChange}
      isScrolled={isScrolled}
      className={className}
    />
  );
};

export default NavigationContainer;