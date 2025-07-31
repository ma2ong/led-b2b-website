/**
 * 解决方案列表页面
 */
import React from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import SolutionsPage from '@/components/solutions/SolutionsPage';
import SEOHead from '@/components/seo/SEOHead';

const Solutions: React.FC = () => {
  return (
    <>
      <SEOHead
        title="LED Display Solutions"
        description="Comprehensive LED display solutions for various industries including retail, hospitality, transportation, and more."
        keywords="LED display solutions, digital signage, outdoor advertising, indoor displays, retail solutions"
      />
      <SolutionsPage />
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', [
        'common',
        'solutions',
        'products',
        'forms'
      ])),
    },
  };
};

export default Solutions;