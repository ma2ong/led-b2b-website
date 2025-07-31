import type { NextPage, GetStaticProps } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import NavigationContainer from '@/components/navigation/NavigationContainer';
import HeroSection from '@/components/home/HeroSection';
import CompanyStats from '@/components/home/CompanyStats';
import ProductCarousel from '@/components/home/ProductCarousel';

const Home: NextPage = () => {
  const { t } = useTranslation('home');

  return (
    <>
      <NavigationContainer />
      
      <Head>
        <title>{t('meta.title')} | Lejin LED Display</title>
        <meta name="description" content={t('meta.description')} />
        <meta name="keywords" content="LED display, LED screen, manufacturer, China, Shenzhen, indoor LED, outdoor LED, rental LED" />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${t('meta.title')} | Lejin LED Display`} />
        <meta property="og:description" content={t('meta.description')} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://lejin-led.com" />
        <meta property="og:image" content="/images/og-image.jpg" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${t('meta.title')} | Lejin LED Display`} />
        <meta name="twitter:description" content={t('meta.description')} />
        <meta name="twitter:image" content="/images/twitter-image.jpg" />
        
        {/* 结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Shenzhen Lejin Optoelectronics Co., Ltd.',
              alternateName: 'Lejin LED',
              url: 'https://lejin-led.com',
              logo: 'https://lejin-led.com/images/logo.png',
              description: 'Professional LED display manufacturer with 17+ years experience',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'CN',
                addressRegion: 'Guangdong',
                addressLocality: 'Shenzhen',
              },
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+86-755-12345678',
                contactType: 'sales',
                availableLanguage: ['English', 'Chinese'],
              },
              foundingDate: '2007',
              numberOfEmployees: '200-500',
              industry: 'LED Display Manufacturing',
            }),
          }}
        />
      </Head>

      <main className="min-h-screen">
        {/* Hero Section */}
        <HeroSection />

        {/* Company Stats */}
        <CompanyStats />

        {/* Featured Products */}
        <ProductCarousel
          title="Featured LED Display Solutions"
          subtitle="Discover our most popular and innovative LED display products trusted by clients worldwide"
        />
      </main>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'home'])),
    },
  };
};

export default Home;