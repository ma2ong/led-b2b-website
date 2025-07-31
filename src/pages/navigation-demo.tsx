import React from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import NavigationContainer from '@/components/navigation/NavigationContainer';
import Breadcrumb from '@/components/navigation/Breadcrumb';

const NavigationDemo: React.FC = () => {
  const breadcrumbItems = [
    { label: 'Products', href: '/products' },
    { label: 'Fine Pitch LED', href: '/products/fine-pitch' },
    { label: 'P1.25 Display', current: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationContainer />
      
      <main className="container-custom py-8">
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Navigation Demo</h1>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Desktop Navigation</h2>
              <p className="text-gray-600">
                The desktop navigation includes a logo, main navigation items with dropdown menus, 
                language switcher, search button, and a CTA button. It changes appearance when scrolled.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Mobile Navigation</h2>
              <p className="text-gray-600">
                On mobile devices, the navigation collapses into a hamburger menu that opens a 
                full-screen overlay with all navigation items and language switcher.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Language Switching</h2>
              <p className="text-gray-600">
                The language switcher supports English and Chinese, maintaining the current page 
                when switching languages.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Breadcrumb Navigation</h2>
              <p className="text-gray-600">
                Breadcrumb navigation helps users understand their current location and navigate 
                back to parent pages.
              </p>
            </section>
          </div>
          
          {/* 添加一些内容来测试滚动效果 */}
          <div className="mt-12 space-y-8">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Section {i + 1}
                </h3>
                <p className="text-gray-600">
                  This is some content to demonstrate the scroll behavior of the navigation. 
                  When you scroll down, the navigation bar will change its appearance to show 
                  a backdrop blur effect and shadow.
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};

export default NavigationDemo;