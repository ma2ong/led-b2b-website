import type { NextPage, GetStaticProps } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import NavigationContainer from '@/components/navigation/NavigationContainer';
import DesignSystemShowcase from '@/components/design-system/DesignSystemShowcase';

const DesignSystemPage: NextPage = () => {
  return (
    <>
      <NavigationContainer />
      
      <Head>
        <title>Design System | LED Display B2B Website</title>
        <meta name="description" content="Complete design system for LED display B2B website" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <DesignSystemShowcase />
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

export default DesignSystemPage;