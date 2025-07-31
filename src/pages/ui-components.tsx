import type { NextPage, GetStaticProps } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import NavigationContainer from '@/components/navigation/NavigationContainer';
import UIShowcase from '@/components/ui/UIShowcase';

const UIComponentsPage: NextPage = () => {
  return (
    <>
      <NavigationContainer />
      
      <Head>
        <title>UI Components | LED Display B2B Website</title>
        <meta name="description" content="Complete set of reusable UI components for LED display B2B website" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <UIShowcase />
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};

export default UIComponentsPage;