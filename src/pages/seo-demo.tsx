import React from 'react';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';

import { HrefLangTags, LocalizedMetaTags, StructuredData, organizationStructuredData } from '@/components/seo/HrefLangTags';
import { LocalizedDateTime, LocalizedNumber, LocalizedCurrency } from '@/components/i18n/LocalizedDateTime';
import LanguageSwitcher from '@/components/navigation/LanguageSwitcher';
import { SupportedLocale } from '@/lib/i18n';

interface SEODemoPageProps {
  // 可以添加从服务器端获取的数据
}

const SEODemoPage: React.FC<SEODemoPageProps> = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const locale = (router.locale || 'en') as SupportedLocale;

  const handleLocaleChange = (newLocale: SupportedLocale) => {
    router.push(router.asPath, router.asPath, { locale: newLocale });
  };

  // 页面特定的结构化数据
  const pageStructuredData = {
    name: t('seo.demo.title'),
    description: t('seo.demo.description'),
    url: `${process.env.NEXT_PUBLIC_SITE_URL}${router.asPath}`,
    inLanguage: locale,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Lejin LED',
      url: process.env.NEXT_PUBLIC_SITE_URL,
    },
  };

  return (
    <>
      <Head>
        <title>{t('seo.demo.title')} | Lejin LED</title>
        <meta name="description" content={t('seo.demo.description')} />
        <meta name="keywords" content={t('seo.demo.keywords')} />
      </Head>

      {/* SEO组件 */}
      <HrefLangTags />
      <LocalizedMetaTags
        title={t('seo.demo.title')}
        description={t('seo.demo.description')}
        locale={locale}
        ogImage={`${process.env.NEXT_PUBLIC_SITE_URL}/images/seo-demo-og.jpg`}
      />
      
      {/* 结构化数据 */}
      <StructuredData type="Organization" data={organizationStructuredData} />
      <StructuredData type="WebPage" data={pageStructuredData} />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 页面头部 */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-gray-900">
                {t('seo.demo.title')}
              </h1>
              <LanguageSwitcher
                currentLocale={locale}
                onLocaleChange={handleLocaleChange}
              />
            </div>
            <p className="text-gray-600">
              {t('seo.demo.description')}
            </p>
          </div>

          {/* 国际化组件演示 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* 日期时间格式化 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('demo.datetime.title')}
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">{t('demo.datetime.current')}:</span>
                  <div className="font-medium">
                    <LocalizedDateTime date={new Date()} format="full" />
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">{t('demo.datetime.relative')}:</span>
                  <div className="font-medium">
                    <LocalizedDateTime 
                      date={new Date(Date.now() - 3600000)} 
                      relative 
                    />
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">{t('demo.datetime.short')}:</span>
                  <div className="font-medium">
                    <LocalizedDateTime date={new Date()} format="short" />
                  </div>
                </div>
              </div>
            </div>

            {/* 数字和货币格式化 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('demo.numbers.title')}
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">{t('demo.numbers.decimal')}:</span>
                  <div className="font-medium">
                    <LocalizedNumber value={1234567.89} />
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">{t('demo.numbers.currency')}:</span>
                  <div className="font-medium">
                    <LocalizedCurrency amount={1234567.89} />
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">{t('demo.numbers.percent')}:</span>
                  <div className="font-medium">
                    <LocalizedNumber value={0.1234} style="percent" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SEO信息展示 */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('demo.seo.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('demo.seo.current_locale')}
                </h3>
                <div className="bg-gray-50 p-3 rounded">
                  <code className="text-sm">
                    {JSON.stringify({
                      locale,
                      htmlLang: locale === 'zh' ? 'zh-CN' : 'en',
                      direction: 'ltr',
                      currency: locale === 'zh' ? 'CNY' : 'USD',
                    }, null, 2)}
                  </code>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('demo.seo.meta_tags')}
                </h3>
                <div className="bg-gray-50 p-3 rounded">
                  <code className="text-sm">
                    {`<meta property="og:locale" content="${locale === 'zh' ? 'zh_CN' : 'en_US'}" />
<meta property="og:title" content="${t('seo.demo.title')}" />
<meta property="og:description" content="${t('seo.demo.description')}" />`}
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* 语言切换演示 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('demo.language_switching.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('demo.language_switching.description')}
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {t('demo.language_switching.current')}:
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">
                  {locale === 'zh' ? '🇨🇳' : '🇺🇸'}
                </span>
                <span className="font-medium">
                  {locale === 'zh' ? '中文' : 'English'}
                </span>
              </div>
              <LanguageSwitcher
                currentLocale={locale}
                onLocaleChange={handleLocaleChange}
                variant="compact"
              />
            </div>
          </div>

          {/* 技术信息 */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              {t('demo.tech_info', {
                locale,
                path: router.asPath,
                timestamp: new Date().toISOString(),
              })}
            </p>
          </div>
        </div>
      </div>
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

export default SEODemoPage;