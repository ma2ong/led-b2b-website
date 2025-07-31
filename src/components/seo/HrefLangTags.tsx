import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { generateHrefLangTags, generateLanguageAlternates } from '@/lib/i18n-config';
import { SupportedLocale } from '@/lib/i18n';

interface HrefLangTagsProps {
  currentPath?: string;
  canonicalUrl?: string;
}

/**
 * HrefLang标签组件
 * 用于SEO优化，告诉搜索引擎页面的语言版本
 */
export const HrefLangTags: React.FC<HrefLangTagsProps> = ({
  currentPath,
  canonicalUrl,
}) => {
  const router = useRouter();
  const path = currentPath || router.asPath;
  
  // 生成hreflang标签
  const hrefLangTags = generateHrefLangTags(path);
  
  // 生成语言替代链接
  const languageAlternates = generateLanguageAlternates(path);
  
  // 当前页面的规范URL
  const currentCanonical = canonicalUrl || `${process.env.NEXT_PUBLIC_SITE_URL}${path}`;

  return (
    <Head>
      {/* 规范链接 */}
      <link rel="canonical" href={currentCanonical} />
      
      {/* hreflang标签 */}
      {hrefLangTags.map(({ hrefLang, href }) => (
        <link
          key={hrefLang}
          rel="alternate"
          hrefLang={hrefLang}
          href={href}
        />
      ))}
      
      {/* x-default标签（用于未指定语言的用户） */}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={languageAlternates['en']}
      />
    </Head>
  );
};

interface LocalizedMetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  locale?: SupportedLocale;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
}

/**
 * 本地化Meta标签组件
 * 根据当前语言设置适当的meta标签
 */
export const LocalizedMetaTags: React.FC<LocalizedMetaTagsProps> = ({
  title,
  description,
  keywords,
  locale,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
}) => {
  const router = useRouter();
  const currentLocale = (locale || router.locale || 'en') as SupportedLocale;
  const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}${router.asPath}`;
  
  // 默认图片
  const defaultOgImage = `${process.env.NEXT_PUBLIC_SITE_URL}/images/og-default.jpg`;
  const imageUrl = ogImage || defaultOgImage;

  return (
    <Head>
      {/* 基础meta标签 */}
      <meta httpEquiv="Content-Language" content={currentLocale} />
      <meta name="language" content={currentLocale} />
      
      {title && <title>{title}</title>}
      {title && <meta property="og:title" content={title} />}
      {title && <meta name="twitter:title" content={title} />}
      
      {description && <meta name="description" content={description} />}
      {description && <meta property="og:description" content={description} />}
      {description && <meta name="twitter:description" content={description} />}
      
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Open Graph标签 */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:locale" content={currentLocale === 'zh' ? 'zh_CN' : 'en_US'} />
      <meta property="og:site_name" content="Lejin LED" />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title || 'Lejin LED'} />
      
      {/* Twitter Card标签 */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content="@lejinled" />
      <meta name="twitter:creator" content="@lejinled" />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={title || 'Lejin LED'} />
      
      {/* 其他语言版本的alternate标签 */}
      {currentLocale === 'en' && (
        <meta property="og:locale:alternate" content="zh_CN" />
      )}
      {currentLocale === 'zh' && (
        <meta property="og:locale:alternate" content="en_US" />
      )}
    </Head>
  );
};

interface StructuredDataProps {
  type: 'Organization' | 'WebSite' | 'Product' | 'Article' | 'BreadcrumbList';
  data: Record<string, any>;
}

/**
 * 结构化数据组件
 * 用于SEO优化，提供结构化数据给搜索引擎
 */
export const StructuredData: React.FC<StructuredDataProps> = ({
  type,
  data,
}) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData, null, 2),
        }}
      />
    </Head>
  );
};

// 预定义的结构化数据模板
export const organizationStructuredData = {
  name: 'Shenzhen Lejin Optoelectronics Co., Ltd.',
  alternateName: 'Lejin LED',
  url: process.env.NEXT_PUBLIC_SITE_URL,
  logo: `${process.env.NEXT_PUBLIC_SITE_URL}/images/logo.png`,
  description: 'Professional LED display manufacturer and solution provider',
  foundingDate: '2010',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Shenzhen, Guangdong',
    addressCountry: 'CN',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+86-755-1234-5678',
    contactType: 'sales',
    email: 'sales@lejin-led.com',
  },
  sameAs: [
    'https://www.linkedin.com/company/lejin-led',
    'https://www.facebook.com/lejinled',
    'https://twitter.com/lejinled',
  ],
};

export const websiteStructuredData = {
  url: process.env.NEXT_PUBLIC_SITE_URL,
  name: 'Lejin LED',
  description: 'Professional LED display solutions',
  publisher: {
    '@type': 'Organization',
    name: 'Lejin LED',
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${process.env.NEXT_PUBLIC_SITE_URL}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export default HrefLangTags;